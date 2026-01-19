#!/bin/zsh

# C4 GenAI Suite + LLM-Eval - Development Startup Script with tmux
# Split current tmux pane into 6 sections and run:
# pane 0: Backend (NestJS)
# pane 1: Frontend (Vite)
# pane 2: REIS Service (Python)
# pane 3: Eval Service (FastAPI)
# pane 4: Celery Worker
# pane 5: Docker Status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION_NAME="c4-dev"

# Function to print status messages
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  C4 GenAI Suite + LLM-Eval Development Startup          ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    print_error "tmux is not installed. Please install it first:"
    echo "  macOS: brew install tmux"
    echo "  Linux: sudo apt-get install tmux"
    exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

echo "🧹 Cleaning up previous processes..."

# Kill processes on ports
echo "Killing backend processes on port 3000..."
PIDS=$(lsof -ti tcp:3000 2>/dev/null); if [ -n "$PIDS" ]; then echo "Killing processes on 3000: $PIDS"; kill -9 $PIDS 2>/dev/null || true; fi

echo "Killing REIS processes on port 3201..."
PIDS=$(lsof -ti tcp:3201 2>/dev/null); if [ -n "$PIDS" ]; then echo "Killing processes on 3201: $PIDS"; kill -9 $PIDS 2>/dev/null || true; fi

echo "Killing eval processes on port 3202..."
PIDS=$(lsof -ti tcp:3202 2>/dev/null); if [ -n "$PIDS" ]; then echo "Killing processes on 3202: $PIDS"; kill -9 $PIDS 2>/dev/null || true; fi

echo "Killing frontend processes on port 5173..."
PIDS=$(lsof -ti tcp:5173 2>/dev/null); if [ -n "$PIDS" ]; then echo "Killing processes on 5173: $PIDS"; kill -9 $PIDS 2>/dev/null || true; fi

# Check for required files
print_status "Checking environment files..."

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
    print_warning "backend/.env not found. Creating from template..."
    cd "$ROOT_DIR"
    npm run env 2>/dev/null || true
fi

if [ ! -f "$ROOT_DIR/services/eval/.env" ]; then
    print_warning "services/eval/.env not found. Creating..."
    cat > "$ROOT_DIR/services/eval/.env" << 'EOF'
# PostgreSQL (shared with C4)
PG_HOST=localhost
PG_USER=admin
PG_PASSWORD=secret
PG_DB=cccc
PG_PORT=5432
PG_SCHEMA=llm_eval

# RabbitMQ (for Celery)
CELERY_BROKER_HOST=localhost
CELERY_BROKER_USER=rabbit
CELERY_BROKER_PASSWORD=rabbit
CELERY_BROKER_PORT=5672

# Encryption key (generate with: openssl rand -base64 32)
LLM_EVAL_ENCRYPTION_KEY=changeme-generate-a-real-key

# Evaluation settings
EVALUATION_MAX_RETRIES=10
EVALUATION_RUN_ASYNC=True
EVALUATION_PARALLEL_TEST_CASES=1
RAGAS_PARALLEL_GENERATION_LIMIT=5
EOF
    print_warning "Please update services/eval/.env with your configuration!"
fi

# Check backend .env has EVAL_SERVICE_URL
if ! grep -q "EVAL_SERVICE_URL" "$ROOT_DIR/backend/.env" 2>/dev/null; then
    print_status "Adding EVAL_SERVICE_URL to backend/.env..."
    echo "" >> "$ROOT_DIR/backend/.env"
    echo "# LLM Eval Service" >> "$ROOT_DIR/backend/.env"
    echo "EVAL_SERVICE_URL=http://localhost:3202" >> "$ROOT_DIR/backend/.env"
fi

print_success "Environment files ready"

# Stop any existing containers
print_status "Stopping existing Docker containers..."
docker compose down 2>/dev/null || true

# Start Docker containers
print_status "Starting Docker containers (PostgreSQL, MinIO, RabbitMQ)..."

# Check if docker-compose.dev.yml exists
if [ -f "$ROOT_DIR/docker-compose.dev.yml" ]; then
    docker-compose -f docker-compose.dev.yml up -d
else
    print_warning "docker-compose.dev.yml not found, starting minimal containers..."

    # Remove existing containers
    docker rm -f c4-postgres c4-minio c4-rabbitmq 2>/dev/null || true

    # Start PostgreSQL
    docker run -d --name c4-postgres \
        -e POSTGRES_USER=admin \
        -e POSTGRES_PASSWORD=secret \
        -e POSTGRES_DB=cccc \
        -p 5432:5432 \
        pgvector/pgvector:pg16

    # Start MinIO
    docker run -d --name c4-minio \
        -e MINIO_ROOT_USER=admin \
        -e MINIO_ROOT_PASSWORD=secretsecret \
        -p 9000:9000 -p 9001:9001 \
        minio/minio:latest server /data --console-address ":9001"

    # Start RabbitMQ
    docker run -d --name c4-rabbitmq \
        -e RABBITMQ_DEFAULT_USER=rabbit \
        -e RABBITMQ_DEFAULT_PASS=rabbit \
        -p 5672:5672 -p 15672:15672 \
        rabbitmq:4.0-management
fi

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if PGPASSWORD=secret psql -h localhost -U admin -d cccc -c "SELECT 1" &>/dev/null; then
        print_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

# Wait for RabbitMQ to be ready
print_status "Waiting for RabbitMQ to be ready..."
for i in {1..30}; do
    if curl -s -u rabbit:rabbit http://localhost:15672/api/overview &>/dev/null; then
        print_success "RabbitMQ is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "RabbitMQ might not be ready, continuing anyway..."
        break
    fi
    sleep 1
done

print_success "Docker containers started"

echo "🚀 Starting tmux panes..."

# Check if we're in a tmux session
if [ -z "$TMUX" ]; then
    print_error "This script must be run from within a tmux session."
    echo ""
    echo "Please run:"
    echo "  tmux"
    echo "  ./dev-start-tmux.sh"
    echo ""
    echo "Or if you already have a session:"
    echo "  tmux attach"
    exit 1
fi

# Get current session, window, and pane
SESSION=$(tmux display-message -p '#{session_name}')
WINDOW=$(tmux display-message -p '#{window_index}')
CURRENT_PANE=$(tmux display-message -p '#{pane_index}')

echo "Session: $SESSION, Window: $WINDOW, Current Pane: $CURRENT_PANE"

# Kill all panes except the current one (in reverse order)
echo "Cleaning existing panes..."
tmux list-panes -t "$SESSION:$WINDOW" -F "#{pane_index}" | sort -rn | while read pane; do
    if [ "$pane" != "$CURRENT_PANE" ]; then
        tmux kill-pane -t "$SESSION:$WINDOW.$pane" 2>/dev/null || true
    fi
done

# Split into 6 panes
# Layout:
# ┌─────────────┬─────────────┐
# │   Backend   │  Frontend   │
# ├─────────────┼─────────────┤
# │    REIS     │    Eval     │
# ├─────────────┼─────────────┤
# │   Celery    │   Docker    │
# └─────────────┴─────────────┘

print_status "Creating pane layout..."

# Split horizontally (creates left and right)
tmux split-window -h -t "$SESSION:$WINDOW"

# Split left pane twice vertically
tmux split-window -v -t "$SESSION:$WINDOW.0"
tmux split-window -v -t "$SESSION:$WINDOW.1"

# Split right pane twice vertically
tmux split-window -v -t "$SESSION:$WINDOW.3"
tmux split-window -v -t "$SESSION:$WINDOW.4"

# Get all pane indices
panes=($(tmux list-panes -t "$SESSION:$WINDOW" -F "#{pane_index}"))
pane_backend=${panes[0]}
pane_reis=${panes[1]}
pane_celery=${panes[2]}
pane_frontend=${panes[3]}
pane_eval=${panes[4]}
pane_docker=${panes[5]}

echo "✅ Created 6 tmux panes:"
echo "  pane $pane_backend: Backend (NestJS)"
echo "  pane $pane_frontend: Frontend (Vite)"
echo "  pane $pane_reis: REIS Service"
echo "  pane $pane_eval: Eval Service"
echo "  pane $pane_celery: Celery Worker"
echo "  pane $pane_docker: Docker Status"

# Pane 0: Backend
tmux send-keys -t "$SESSION:$WINDOW.$pane_backend" "cd '$ROOT_DIR/backend' && clear && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo '  C4 Backend (NestJS) - Port 3000' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && npm install --silent && npm run start:dev" Enter

# Pane 1: Frontend
tmux send-keys -t "$SESSION:$WINDOW.$pane_frontend" "cd '$ROOT_DIR/frontend' && clear && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo '  C4 Frontend (Vite) - Port 5173' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && npm install --silent && npm run dev" Enter

# Pane 2: REIS
if command -v poetry &> /dev/null; then
    tmux send-keys -t "$SESSION:$WINDOW.$pane_reis" "cd '$ROOT_DIR/services/reis' && clear && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo '  REIS Service (Python) - Port 3201' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && poetry run fastapi dev rei_s/app.py --port 3201" Enter
else
    tmux send-keys -t "$SESSION:$WINDOW.$pane_reis" "cd '$ROOT_DIR/services/reis' && clear && echo '❌ Poetry not installed' && echo 'Install: curl -sSL https://install.python-poetry.org | python3 -'" Enter
fi

# Pane 3: Eval Service
if command -v poetry &> /dev/null; then
    tmux send-keys -t "$SESSION:$WINDOW.$pane_eval" "cd '$ROOT_DIR/services/eval' && clear && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo '  Eval Service (FastAPI) - Port 3202' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && poetry install --quiet && poetry run uvicorn llm_eval.main:app --reload --port 3202" Enter
else
    tmux send-keys -t "$SESSION:$WINDOW.$pane_eval" "cd '$ROOT_DIR/services/eval' && clear && echo '❌ Poetry not installed' && echo 'Install: curl -sSL https://install.python-poetry.org | python3 -'" Enter
fi

# Pane 4: Celery Worker
if command -v poetry &> /dev/null; then
    tmux send-keys -t "$SESSION:$WINDOW.$pane_celery" "cd '$ROOT_DIR/services/eval' && clear && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo '  Celery Worker (Async Tasks)' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo 'Waiting 10s for eval service...' && sleep 10 && poetry run celery -A llm_eval.tasks worker --loglevel=info" Enter
else
    tmux send-keys -t "$SESSION:$WINDOW.$pane_celery" "cd '$ROOT_DIR/services/eval' && clear && echo '❌ Poetry not installed'" Enter
fi

# Pane 5: Docker status and info
tmux send-keys -t "$SESSION:$WINDOW.$pane_docker" "cd '$ROOT_DIR' && clear && cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  C4 Development Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Docker Containers:
EOF
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E 'c4-|postgres|minio|rabbitmq|NAMES'
cat << 'EOF'

🔗 Service URLs:
  • Frontend:  http://localhost:5173
  • Backend:   http://localhost:3000
  • REIS:      http://localhost:3201
  • Eval:      http://localhost:3202
  • MinIO:     http://localhost:9001 (admin/secretsecret)
  • RabbitMQ:  http://localhost:15672 (rabbit/rabbit)

🔐 Login Credentials:
  • Email:     admin@example.com
  • Password:  secret

💡 Tmux Commands:
  • Ctrl+B then D  - Detach
  • Ctrl+B then [  - Scroll mode
  • Ctrl+B then O  - Next pane
  • Ctrl+B then Z  - Zoom pane
  • Ctrl+C         - Stop service

✅ All services are starting...
   Watch the other panes for progress.
EOF
" Enter

echo ""
print_success "✅ Created 6 tmux panes successfully!"
echo ""
echo "Layout:"
echo "  ┌─────────────┬─────────────┐"
echo "  │   Backend   │  Frontend   │"
echo "  ├─────────────┼─────────────┤"
echo "  │    REIS     │    Eval     │"
echo "  ├─────────────┼─────────────┤"
echo "  │   Celery    │   Docker    │"
echo "  └─────────────┴─────────────┘"
echo ""
echo "Panes:"
echo "  pane $pane_backend: Backend (NestJS)"
echo "  pane $pane_frontend: Frontend (Vite)"
echo "  pane $pane_reis: REIS Service"
echo "  pane $pane_eval: Eval Service"
echo "  pane $pane_celery: Celery Worker"
echo "  pane $pane_docker: Docker Status"
echo ""
echo "🚀 Services are starting..."
echo ""
