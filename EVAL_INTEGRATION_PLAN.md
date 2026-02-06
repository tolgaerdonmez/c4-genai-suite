---
# created with claude code
session: 52c82202-184a-4b06-9260-db16e1933555
---

# C4 Evals Integration Plan - Complete Feature Migration

This document tracks the complete migration of llmeval features into c4-genai-suite under `/admin/evals`.

## Legend

- ✅ **DONE** - Fully implemented and tested
- 🚧 **IN PROGRESS** - Currently being worked on
- ⏳ **TODO** - Not started yet
- 🔍 **NEEDS REVIEW** - Implemented but needs verification

---

## 1. Dashboard / Home Page

### 1.1 Dashboard Data Display

- ⏳ Dashboard page with statistics cards
- ⏳ Last evaluation results card
- ⏳ Recent evaluations list
- ⏳ Quick stats (total evaluations, catalogs, metrics)
- ⏳ Dashboard API integration (`/api/dashboard`)

---

## 2. QA Catalogs Management

### 2.1 QA Catalogs List Page ✅

- ✅ List all QA catalogs
- ✅ Catalog preview cards/table
- ✅ Status indicators (ready, generating, error)
- ✅ Create catalog dialog (empty/upload/generate tabs)
- ✅ Search and filter catalogs
- ✅ Navigate to catalog details

### 2.2 QA Catalog Detail Page ✅

- ✅ View catalog metadata (name, revision, dates)
- ✅ Display QA pairs in table/cards
- ✅ Pagination for QA pairs
- ✅ Status chip with error handling
- ✅ Version history dropdown/selector

### 2.3 QA Catalog CRUD Operations ✅

- ✅ Create empty catalog
- ✅ Upload catalog from file (CSV, JSON, XLSX)
- ✅ Download catalog in multiple formats
- ✅ Delete catalog with confirmation
- ✅ Add QA pair dialog
- ✅ Edit QA pair dialog
- ✅ Delete QA pair with undo
- ✅ Bulk save pending changes
- ✅ Track additions/updates/deletions before save
- ✅ Upload new version of catalog

### 2.4 QA Catalog Generation 🚧 (deffered until later, not to be implemented, ignore this)

- 🔍 **NEEDS REVIEW**: Route exists but page not implemented
- ⏳ Generation page UI (`/admin/evals/qa-catalogs/generate`)
- ⏳ Select generator type (Ragas, C4 Bucket, etc.)
- ⏳ Configuration form for generator
  - ⏳ Document upload/selection
  - ⏳ Generator-specific settings
  - ⏳ Model configuration
  - ⏳ Persona selection (for Ragas)
  - ⏳ Query synthesizer options
- ⏳ Submit generation task
- ⏳ Monitor generation progress
- ⏳ Handle generation errors
- ⏳ Navigate to generated catalog when complete
- ⏳ Generation from C4 bucket integration

### 2.5 QA Catalog Components (Reusable)

- ✅ QaCatalogStatusChip
- ✅ QaPairsTable
- ⏳ QaCatalogCard (for list view)
- ⏳ QaPairPreview
- ⏳ ContextsDisplay (for displaying context arrays)

---

## 3. LLM Endpoints Management

### 3.1 LLM Endpoints List Page ✅

- ✅ List all LLM endpoints
- ✅ Endpoints table with type, status, features
- ✅ Create endpoint dialog
- ✅ Edit endpoint dialog
- ✅ Delete endpoint with confirmation
- ✅ Endpoint type chips

### 3.2 LLM Endpoint Detail Page ⏳

- ⏳ View endpoint details page
- ⏳ Show configuration (read-only)
- ⏳ Test endpoint functionality
- ⏳ Usage statistics/history
- ⏳ Edit button leading to edit dialog/page

### 3.3 LLM Endpoint CRUD Operations ✅

- ✅ Create endpoint wizard
  - ✅ Step 1: Select endpoint type
  - ✅ Step 2: Configure endpoint
- ✅ Endpoint type specific forms
  - ✅ C4 LLM Endpoint configuration
  - ✅ OpenAI configuration
  - ✅ Azure OpenAI configuration
- ✅ Base configuration fields (name, description)
- ✅ Edit endpoint
- ✅ Delete endpoint
- ✅ Validate endpoint configuration

### 3.4 LLM Endpoint Components

- ✅ LlmEndpointsTable
- ✅ LlmEndpointTypeChip
- ✅ LlmEndpointFeaturesBadge
- ⏳ EndpointTestDialog (test connection)
- ⏳ EndpointUsageStats

---

## 4. Metrics Management

### 4.1 Metrics List Page ✅

- ✅ List all metrics in table
- ✅ Display metric type, threshold, chat model
- ✅ Create metric wizard/dialog
- ✅ Edit metric dialog
- ✅ Delete metric with confirmation
- ✅ Search and filter metrics
- ✅ Pagination (PAGE_SIZE = 20)
- ✅ Navigate to metric detail page

### 4.2 Metric Detail Page ✅

- ✅ View metric details
- ✅ Show metric configuration (read-only)
- ✅ Display metric type with colored badge
- ✅ Edit button
- ✅ Delete button
- ✅ Usage in evaluations section (placeholder)
- ✅ Breadcrumb navigation

### 4.3 Metric CRUD Operations ✅

- ✅ Create metric wizard
  - ✅ Step 1: Select metric type (4 types)
  - ✅ Step 2: Configure metric
- ✅ Metric type specific forms
  - ✅ Answer Relevancy configuration
  - ✅ Faithfulness configuration
  - ✅ Hallucination configuration
  - ✅ G-Eval configuration
- ✅ Base metric fields (name, threshold, chatModel, strictMode)
- ✅ Edit metric configuration
- ✅ Delete metric with version handling
- ✅ Validate metric configuration with Zod
- ✅ Version conflict handling (409 errors)

### 4.4 Metric Components ✅

- ✅ MetricsTable (with skeleton loading)
- ✅ MetricTypeChip (color-coded badges)
- ✅ BaseMetricFields (shared fields)
- ✅ SimpleMetricFields (for 3 simple metrics)
- ✅ GEvalMetricFields (with dynamic steps array)
- ✅ MetricTypeStep (wizard step 1)
- ✅ MetricConfigurationStep (router component)
- ✅ CreateMetricDialog (multi-step wizard)
- ✅ EditMetricDialog (single-step)
- ✅ DeleteMetricDialog (confirmation)

---

## 5. Evaluations Management

### 5.1 Evaluations List Page 🚧

- 🔍 **NEEDS REVIEW**: Basic page exists, needs full implementation
- ⏳ List all evaluations
- ⏳ Display evaluation status (pending, running, completed, failed)
- ⏳ Show QA catalog, metrics, LLM endpoint
- ⏳ Show progress for running evaluations
- ⏳ Create new evaluation button
- ⏳ Search and filter evaluations
- ⏳ Navigate to evaluation details
- ⏳ Navigate to evaluation results
- ⏳ Delete evaluation
- ⏳ Infinite scroll or pagination

### 5.2 Create Evaluation Page ⏳

- ⏳ New evaluation page (`/admin/evals/evaluations/new`)
- ⏳ Multi-step form or wizard
  - ⏳ Step 1: Select evaluation type (by catalog or manual test cases)
  - ⏳ Step 2: Select QA catalog or enter test cases
  - ⏳ Step 3: Select metrics (multiple)
  - ⏳ Step 4: Select LLM endpoint
  - ⏳ Step 5: Review and submit
- ⏳ Support for manual test cases
- ⏳ Test case builder (question, expected output, contexts)
- ⏳ Form validation
- ⏳ Submit evaluation
- ⏳ Navigate to evaluation details after creation

### 5.3 Evaluation Detail Page ⏳

- ⏳ View evaluation details (`/admin/evals/evaluations/:id`)
- ⏳ Show evaluation metadata
  - ⏳ Name, description
  - ⏳ QA catalog used
  - ⏳ Metrics configured
  - ⏳ LLM endpoint used
  - ⏳ Status and progress
- ⏳ Display test case count
- ⏳ Show creation and update times
- ⏳ Actions menu
  - ⏳ Run evaluation
  - ⏳ Edit evaluation
  - ⏳ Delete evaluation
  - ⏳ Clone evaluation
  - ⏳ Compare with others
- ⏳ List of evaluation results (runs)
- ⏳ Navigate to result details

### 5.4 Edit Evaluation Page ⏳

- ⏳ Edit evaluation page (`/admin/evals/evaluations/:id/edit`)
- ⏳ Update evaluation name/description
- ⏳ Modify QA catalog selection
- ⏳ Update metrics
- ⏳ Change LLM endpoint
- ⏳ Cannot edit while running
- ⏳ Save changes

### 5.5 Evaluation Result Detail Page ⏳

- ⏳ View evaluation result (`/admin/evals/evaluations/:id/results/:resultId`)
- ⏳ Summary section
  - ⏳ Overall metrics scores
  - ⏳ Pass/fail indicators
  - ⏳ Execution time
  - ⏳ Status
- ⏳ Test cases results table
  - ⏳ Question
  - ⏳ Expected output
  - ⏳ Actual output
  - ⏳ Contexts
  - ⏳ Metric scores per test case
  - ⏳ Pass/fail status
- ⏳ Pagination for test case results
- ⏳ Filter by pass/fail
- ⏳ Export results
- ⏳ Expand test case for details
- ⏳ Real-time updates for running evaluations

### 5.6 Evaluation Comparison Page ⏳

- ⏳ Compare multiple evaluations (`/admin/evals/evaluations/compare?e=id1&e=id2`)
- ⏳ Select evaluations to compare (multi-select)
- ⏳ Side-by-side metrics comparison
- ⏳ Charts for metric scores
- ⏳ Diff view for configurations
- ⏳ Highlight improvements/regressions
- ⏳ Export comparison report

### 5.7 Evaluation Components ⏳

- ⏳ EvaluationsTable
- ⏳ EvaluationStatusChip
- ⏳ EvaluationProgressBar
- ⏳ EvaluationCard
- ⏳ TestCaseBuilder
- ⏳ TestCaseResultsTable
- ⏳ MetricScoresDisplay
- ⏳ EvaluationWizard
- ⏳ ComparisonChart
- ⏳ ComparisonTable

---

## 6. Shared Components & Infrastructure

### 6.1 Layout & Navigation ✅

- ✅ Sidebar navigation for eval pages
- ✅ Routes configured in React Router
- ⏳ Breadcrumbs
- ⏳ Context help panels (help.en.mdx)

### 6.2 API Integration ✅

- ✅ OpenAPI spec generated
- ✅ API client generated (`src/api/generated-eval`)
- ✅ Eval API hooks (`useEvalApi`)
- ✅ Backend proxy configured

### 6.3 State Management 🚧

- ✅ QA Catalogs state (Zustand store)
- ✅ LLM Endpoints state (Zustand store)
- ⏳ Metrics state
- ⏳ Evaluations state
- ⏳ Global evaluation runner state (for real-time updates)

### 6.4 Form Components & Validation ⏳

- ⏳ Reusable form components
- ⏳ Zod schemas for all forms
- ⏳ Form error handling
- ⏳ Loading states
- ⏳ Success/error toasts

### 6.5 Real-time Updates ⏳

- ⏳ WebSocket connection for evaluation progress
- ⏳ Polling for status updates
- ⏳ React Query integration with auto-refetch
- ⏳ Optimistic updates

### 6.6 Testing 🚧

- ⏳ Unit tests for components
- ⏳ Integration tests for forms
- ⏳ E2E tests for critical flows
- ⏳ TDD for new features (per CLAUDE.md)

---

## 7. Internationalization (i18n)

### 7.1 Text Keys ⏳

- 🚧 QA Catalogs texts (partial)
- ⏳ LLM Endpoints texts
- ⏳ Metrics texts
- ⏳ Evaluations texts
- ⏳ Dashboard texts
- ⏳ Common eval texts

### 7.2 Languages ⏳

- 🚧 English (en) - partial
- 🚧 German (de) - partial

---

## 8. Documentation

### 8.1 User Documentation ⏳

- ⏳ Context help for each page (MDX files)
- ⏳ Getting started guide
- ⏳ Feature documentation
- ⏳ API documentation links

### 8.2 Developer Documentation ⏳

- ⏳ Architecture overview
- ⏳ Component documentation
- ⏳ State management patterns
- ⏳ Testing guidelines

---

## 9. Advanced Features (Nice to Have)

### 9.1 Batch Operations ⏳

- ⏳ Bulk delete evaluations
- ⏳ Bulk run evaluations
- ⏳ Bulk export results

### 9.2 Scheduling ⏳

- ⏳ Schedule recurring evaluations
- ⏳ Cron expression builder
- ⏳ View scheduled runs

### 9.3 Notifications ⏳

- ⏳ Email notifications for evaluation completion
- ⏳ Webhook notifications
- ⏳ In-app notifications

### 9.4 Analytics & Reporting ⏳

- ⏳ Trends over time
- ⏳ Performance dashboards
- ⏳ Export reports (PDF, Excel)

### 9.5 Collaboration ⏳

- ⏳ Comments on evaluations
- ⏳ Share evaluation results
- ⏳ Team workspaces

---

## Priority Order (Recommended Implementation Sequence)

### Phase 1: Core Infrastructure (Current)

1. ✅ Backend proxy and API integration
2. ✅ QA Catalogs list and CRUD
3. ✅ LLM Endpoints list and CRUD
4. 🚧 QA Catalog generation page

### Phase 2: Metrics & Evaluation Setup

5. ⏳ Metrics list and CRUD
6. ⏳ Create evaluation wizard
7. ⏳ Evaluations list page

### Phase 3: Evaluation Execution & Results

8. ⏳ Evaluation detail page
9. ⏳ Run evaluation functionality
10. ⏳ Evaluation result detail page
11. ⏳ Real-time progress updates

### Phase 4: Advanced Features

12. ⏳ Dashboard with statistics
13. ⏳ Evaluation comparison
14. ⏳ Edit evaluation functionality
15. ⏳ Export and reporting

### Phase 5: Polish & Enhancement

16. ⏳ Complete i18n
17. ⏳ Context help pages
18. ⏳ Testing coverage
19. ⏳ Performance optimization
20. ⏳ Advanced features (scheduling, notifications, etc.)

---

## Current Status Summary

- **QA Catalogs**: ~90% complete (missing generation page - deferred)
- **LLM Endpoints**: ~85% complete (missing detail page and testing)
- **Metrics**: ✅ 100% complete (all CRUD, detail page, components, i18n)
- **Evaluations**: ~5% complete (placeholder page only)
- **Dashboard**: ~0% complete
- **Overall Progress**: ~50% complete

---

## Notes

- Follow TDD principles for all new implementations (per CLAUDE.md)
- All eval service logic should be in the eval service, not C4 backend
- Use generated API client (`src/api/generated-eval`) for all API calls
- Maintain consistent UI patterns with existing C4 pages
- Add comprehensive error handling and loading states
- Ensure responsive design for all components
