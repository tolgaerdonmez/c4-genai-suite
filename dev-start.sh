#!/bin/bash

# Quick start script for C4 development with Eval service
# This script starts all infrastructure services and gives instructions for starting the app services

set -e

echo "🚀 Starting C4 Development Environment with Eval Service..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start infrastructure services
echo "${BLUE}📦 Starting infrastructure services (PostgreSQL, RabbitMQ, MinIO, Ollama)...${NC}"
docker compose -f docker-compose.dev.yml up -d

echo ""
echo "${GREEN}✅ Infrastructure services started!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}📋 Service Status:${NC}"
echo ""
docker compose -f docker-compose.dev.yml ps
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${BLUE}🔗 Infrastructure URLs:${NC}"
echo "  • PostgreSQL:         localhost:5432 (user: admin, pass: secret, db: cccc)"
echo "  • RabbitMQ AMQP:      localhost:5672"
echo "  • RabbitMQ Management: http://localhost:15672 (user: rabbit, pass: rabbit)"
echo "  • MinIO API:          http://localhost:9000"
echo "  • MinIO Console:      http://localhost:9001 (user: admin, pass: secretsecret)"
echo "  • Ollama:             http://localhost:11434"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}⚠️  Next Steps - Start Application Services:${NC}"
echo ""
echo "${GREEN}1. Backend (Terminal 1):${NC}"
echo "   cd backend"
echo "   npm run start:dev"
echo ""
echo "${GREEN}2. Frontend (Terminal 2):${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "${GREEN}3. REIS Service (Terminal 3):${NC}"
echo "   cd services/reis"
echo "   poetry install"
echo "   poetry run uvicorn rei_s.app:app --reload --port 3201"
echo ""
echo "${GREEN}4. Eval Service (Terminal 4):${NC}"
echo "   cd services/eval"
echo "   poetry install"
echo "   poetry run uvicorn llm_eval.main:app --reload --port 3202"
echo ""
echo "${GREEN}5. Celery Worker for Eval (Terminal 5):${NC}"
echo "   cd services/eval"
echo "   poetry run celery -A llm_eval.tasks worker --loglevel=info"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${BLUE}📱 Access the Application:${NC}"
echo "  • Frontend:  http://localhost:5173"
echo "  • Backend:   http://localhost:3000"
echo "  • REIS:      http://localhost:3201"
echo "  • Eval:      http://localhost:3202"
echo ""
echo "${YELLOW}Login Credentials:${NC}"
echo "  • Email:     admin@example.com"
echo "  • Password:  secret"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${BLUE}💡 Helpful Commands:${NC}"
echo ""
echo "  • Stop infrastructure:    docker compose -f docker-compose.dev.yml down"
echo "  • View logs:              docker compose -f docker-compose.dev.yml logs -f"
echo "  • Reset database:         docker compose -f docker-compose.dev.yml down -v"
echo "  • Check service health:   docker compose -f docker-compose.dev.yml ps"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${GREEN}✨ Ready for development!${NC}"
echo ""
