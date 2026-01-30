---
name: integration-test-generator
description: "Generate comprehensive integration test cases from feature specifications and API contracts for full-stack applications"
disable-model-invocation: false
allowed-tools: ["read", "write", "glob", "grep"]
---

# Integration Test Generator Skill

Automatically generates comprehensive integration test cases from feature specifications, covering API contracts, frontend flows, and end-to-end scenarios. Creates executable test files for both backend (pytest) and frontend (Jest/Playwright) based on acceptance criteria and user stories.

## When to Use This Skill

Invoke this skill when:
- A feature specification has been completed and implementation is ready for testing
- You need to generate integration tests from acceptance criteria
- API endpoints have been implemented and need contract testing
- Frontend components are ready for integration testing
- You want to ensure test coverage matches all user scenarios from the spec
- Converting manual test cases into automated tests

**Example inputs:**
```
Generate integration tests for task-management feature
Create integration tests from specs/features/task-management/spec.md
Generate API and frontend tests for the task-management feature
Generate tests for task CRUD operations
```

## Input Format

User will provide:
1. **Feature name or spec path**: Reference to the feature specification
   - Example: `task-management`
   - Or full path: `specs/features/task-management/spec.md`

2. **Test scope (optional)**: Which tests to generate
   - `backend` - Only backend API tests
   - `frontend` - Only frontend component tests
   - `e2e` - Only end-to-end tests
   - If omitted: generate all test types

3. **Test framework (optional)**: Override default framework
   - Backend default: `pytest`
   - Frontend default: `jest` and `playwright`

**Example inputs:**
```
Generate integration tests for task-management
Generate backend tests for specs/features/task-management/spec.md
Create e2e tests for task-management feature
Generate all tests for user authentication
```

## Test Generation Process

### Step 1: Read and Parse Feature Specification

1. Locate the feature specification file
   - If only feature name provided, search in:
     - `specs/features/<feature-name>/spec.md`
     - `specs/<feature-name>/spec.md`
2. Read the complete specification
3. Extract key testing components:
   - **User Stories**: All acceptance scenarios with Given/When/Then structure
   - **Functional Requirements**: All FR-XXX requirements
   - **Edge Cases**: Documented edge case behaviors
   - **Success Criteria**: Measurable outcomes that must pass
   - **API Contracts**: Expected endpoints, methods, request/response schemas
   - **Validation Rules**: Input validation and error handling requirements

### Step 2: Identify Test Scenarios

For each user story, create test scenarios:

#### A. Backend API Test Scenarios
- [ ] Extract all API endpoints mentioned in user stories
- [ ] Identify HTTP methods (GET, POST, PUT, DELETE, PATCH)
- [ ] Map request schemas (body, query params, path params)
- [ ] Map response schemas (success and error cases)
- [ ] List expected status codes (200, 201, 400, 401, 404, etc.)
- [ ] Identify authentication requirements
- [ ] Document data isolation requirements (user-specific data)

#### B. Frontend Integration Test Scenarios
- [ ] Identify UI components involved in each user story
- [ ] Map user interactions (button clicks, form submissions, navigation)
- [ ] Identify state changes that should occur
- [ ] Document expected UI feedback (error messages, success indicators)
- [ ] List data displayed to user

#### C. End-to-End Test Scenarios
- [ ] Map complete user flows from start to finish
- [ ] Identify multi-step workflows
- [ ] Document expected outcomes at each step
- [ ] Include authentication flows
- [ ] Include error recovery paths

### Step 3: Generate Backend API Tests (pytest)

For each API endpoint, generate test cases covering:

1. **Happy Path Tests**
   - Valid input → Expected successful response
   - Correct status code (200, 201)
   - Response schema validation
   - Database state verification

2. **Validation Tests**
   - Missing required fields → 400 Bad Request
   - Invalid field types → 400 Bad Request
   - Exceeding field constraints (max length, etc.) → 400 Bad Request
   - Invalid field formats (email, etc.) → 400 Bad Request

3. **Authentication Tests**
   - Missing auth token → 401 Unauthorized
   - Invalid auth token → 401 Unauthorized
   - Expired auth token → 401 Unauthorized

4. **Authorization Tests**
   - Accessing another user's data → 403 Forbidden or 404 Not Found
   - Data isolation verification

5. **Edge Case Tests**
   - Empty lists
   - Maximum field lengths
   - Concurrent operations
   - Resource not found → 404

**Backend Test File Structure:**
```python
# backend/tests/integration/test_<feature-name>.py

import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.db import get_session
from sqlmodel import Session, create_engine, SQLModel
from src.models import User, Task  # Import relevant models

# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    # Create test database
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="auth_headers")
def auth_headers_fixture():
    # Create test user and return auth headers
    # This would use your JWT token generation
    return {"Authorization": "Bearer test-token-here"}

# Test cases for each user story
class TestTaskManagement:
    """Integration tests for Task Management feature"""

    def test_create_task_success(self, client, auth_headers):
        """
        User Story: Create New Task
        Scenario: User creates task with valid title and description
        """
        response = client.post(
            "/api/tasks",
            json={"title": "Buy groceries", "description": "Milk, eggs, bread"},
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["description"] == "Milk, eggs, bread"
        assert data["completed"] == False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_missing_title(self, client, auth_headers):
        """
        Edge Case: Creating task without required title field
        Expected: 400 Bad Request with validation error
        """
        response = client.post(
            "/api/tasks",
            json={"description": "Just a description"},
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "title" in response.json()["detail"].lower()

    # Additional test methods...
```

### Step 4: Generate Frontend Integration Tests (Jest)

For each component and user flow:

**Frontend Test File Structure:**
```typescript
// frontend/__tests__/integration/<feature-name>.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '@/components/tasks/TaskList';
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm';

// Mock API calls
jest.mock('@/lib/api-client', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '@/lib/api-client';

describe('Task Management - Create Task Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new task successfully', async () => {
    /**
     * User Story: Create New Task
     * Scenario: User fills form with title and description, submits, sees task in list
     */

    // Mock successful API response
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      id: '123',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      completed: false,
      created_at: '2026-01-30T00:00:00Z',
      updated_at: '2026-01-30T00:00:00Z',
    });

    render(<CreateTaskForm />);

    // User enters title
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Buy groceries' } });

    // User enters description
    const descInput = screen.getByLabelText(/description/i);
    fireEvent.change(descInput, { target: { value: 'Milk, eggs, bread' } });

    // User submits form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    // Assert API was called correctly
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Buy groceries',
          description: 'Milk, eggs, bread',
        }),
      });
    });

    // Assert success message displayed
    expect(await screen.findByText(/task created successfully/i)).toBeInTheDocument();
  });

  it('should show validation error when title is missing', async () => {
    /**
     * Edge Case: Form validation prevents submission without title
     */
    render(<CreateTaskForm />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    // Assert validation error shown
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();

    // Assert API was NOT called
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
```

### Step 5: Generate End-to-End Tests (Playwright)

For complete user flows:

**E2E Test File Structure:**
```typescript
// frontend/e2e/<feature-name>.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task Management - Complete User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as test user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('User can create, view, complete, and delete a task', async ({ page }) => {
    /**
     * Complete E2E flow covering multiple user stories:
     * 1. Create New Task
     * 2. View Task List
     * 3. Mark Task as Complete
     * 4. Delete Task
     */

    // Navigate to tasks page
    await page.goto('/dashboard/tasks');

    // Step 1: Create a new task
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'E2E Test Task');
    await page.fill('textarea[name="description"]', 'This is a test task');
    await page.click('button:has-text("Create Task")');

    // Verify task appears in list
    await expect(page.locator('text=E2E Test Task')).toBeVisible();
    await expect(page.locator('text=This is a test task')).toBeVisible();

    // Step 2: Mark task as complete
    await page.click('button[aria-label="Mark task complete"]:near(text=E2E Test Task)');

    // Verify visual indicator of completion (e.g., strikethrough)
    const taskElement = page.locator('text=E2E Test Task');
    await expect(taskElement).toHaveClass(/completed|line-through/);

    // Step 3: Delete the task
    await page.click('button[aria-label="Delete task"]:near(text=E2E Test Task)');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify task is removed from list
    await expect(page.locator('text=E2E Test Task')).not.toBeVisible();
  });

  test('Data isolation: Users only see their own tasks', async ({ page, context }) => {
    /**
     * Security Requirement: Verify users cannot see other users' tasks
     */

    // User 1 creates a task
    await page.goto('/dashboard/tasks');
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'User 1 Private Task');
    await page.click('button:has-text("Create Task")');
    await expect(page.locator('text=User 1 Private Task')).toBeVisible();

    // Logout
    await page.click('button:has-text("Logout")');

    // Login as different user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user2@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verify User 2 does NOT see User 1's task
    await page.goto('/dashboard/tasks');
    await expect(page.locator('text=User 1 Private Task')).not.toBeVisible();
  });
});
```

### Step 6: Generate Test Documentation

Create a comprehensive test documentation file:

**Test Documentation Structure:**
```markdown
# Integration Test Documentation: <Feature Name>

**Generated**: <ISO Date>
**Feature Spec**: <path-to-spec>
**Test Coverage**: <percentage>% of user stories

---

## Test Summary

- **Total Test Cases**: <number>
- **Backend API Tests**: <number>
- **Frontend Integration Tests**: <number>
- **End-to-End Tests**: <number>
- **User Stories Covered**: <number>/<total>
- **Edge Cases Covered**: <number>/<total>

---

## Test Files Generated

### Backend Tests
- `backend/tests/integration/test_<feature-name>.py`
  - <number> test cases
  - Covers: API contracts, validation, authentication, data isolation

### Frontend Tests
- `frontend/__tests__/integration/<feature-name>.test.tsx`
  - <number> test cases
  - Covers: Component integration, form validation, API interaction

### E2E Tests
- `frontend/e2e/<feature-name>.spec.ts`
  - <number> test cases
  - Covers: Complete user flows, multi-step scenarios

---

## Test Coverage Map

### User Story 1: Create New Task

**Status**: ✅ Fully Covered

**Tests**:
- Backend: `test_create_task_success` (test_task_management.py:45)
- Frontend: `should create a new task successfully` (task-management.test.tsx:20)
- E2E: Included in complete flow (task-management.spec.ts:15)

**Edge Cases Covered**:
- ✅ Missing title validation
- ✅ Title exceeds max length
- ✅ Missing authentication
- ✅ Invalid token

### User Story 2: View Task List

**Status**: ✅ Fully Covered

**Tests**:
- Backend: `test_get_tasks_success` (test_task_management.py:78)
- Backend: `test_get_tasks_data_isolation` (test_task_management.py:95)
- Frontend: `should display list of tasks` (task-management.test.tsx:60)
- E2E: Included in complete flow (task-management.spec.ts:15)

---

## Running Tests

### Backend Tests
```bash
cd backend
pytest tests/integration/test_<feature-name>.py -v
```

### Frontend Integration Tests
```bash
cd frontend
npm test -- __tests__/integration/<feature-name>.test.tsx
```

### E2E Tests
```bash
cd frontend
npx playwright test e2e/<feature-name>.spec.ts
```

### All Tests
```bash
# Backend
cd backend && pytest tests/integration/ -v

# Frontend
cd frontend && npm test && npx playwright test
```

---

## Test Data Requirements

### Test Users
- Primary test user: `test@example.com` / `password123`
- Secondary user (for isolation tests): `user2@example.com` / `password123`

### Test Database
- Backend tests use in-memory SQLite database
- E2E tests use dedicated test database (configure in `.env.test`)

### Setup
```bash
# Create test users (run once)
python backend/scripts/create_test_users.py

# Configure test environment
cp .env.example .env.test
# Edit .env.test with test database credentials
```

---

## Success Criteria Validation

Each test maps to success criteria from the spec:

| Success Criteria | Test(s) | Status |
|-----------------|---------|--------|
| SC-001: Create task in <2s | Backend: test_create_task_success | ✅ |
| SC-004: 100% data isolation | Backend: test_get_tasks_data_isolation, E2E: data isolation test | ✅ |
| SC-007: 100% validation coverage | Backend: all validation tests | ✅ |
| SC-008: Complete CRUD workflow | E2E: complete user flow | ✅ |

---

## Maintenance Notes

- **Regenerate tests** when spec changes: Re-run integration-test-generator skill
- **Update test data** if schemas change: Modify fixtures in test files
- **Add custom tests** in separate files to avoid overwriting generated tests
```

## Output Format

Always return output in this structure:

```markdown
# Integration Test Generation Report

**Feature**: <feature-name>
**Spec File**: <path>
**Generated**: <ISO date>

---

## Summary

- ✅ **Backend Tests**: <number> test cases generated
- ✅ **Frontend Tests**: <number> test cases generated
- ✅ **E2E Tests**: <number> test cases generated
- 📊 **Coverage**: <percentage>% of user stories

---

## Files Generated

### 1. Backend Tests
**File**: `backend/tests/integration/test_<feature-name>.py`
**Test Cases**: <number>
**Lines of Code**: ~<number>

Coverage:
- [✅] Happy path scenarios
- [✅] Validation errors
- [✅] Authentication/authorization
- [✅] Data isolation
- [✅] Edge cases

### 2. Frontend Integration Tests
**File**: `frontend/__tests__/integration/<feature-name>.test.tsx`
**Test Cases**: <number>
**Lines of Code**: ~<number>

Coverage:
- [✅] Component integration
- [✅] Form validation
- [✅] API interaction mocking
- [✅] Error handling

### 3. End-to-End Tests
**File**: `frontend/e2e/<feature-name>.spec.ts`
**Test Cases**: <number>
**Lines of Code**: ~<number>

Coverage:
- [✅] Complete user flows
- [✅] Multi-step scenarios
- [✅] Cross-component interaction
- [✅] Security requirements

### 4. Test Documentation
**File**: `tests/integration-docs/<feature-name>-tests.md`

---

## Next Steps

1. **Review generated tests** to ensure they match your expectations
2. **Run backend tests**: `cd backend && pytest tests/integration/test_<feature-name>.py -v`
3. **Run frontend tests**: `cd frontend && npm test`
4. **Run E2E tests**: `cd frontend && npx playwright test`
5. **Add to CI/CD pipeline** for automated testing

---

## Coverage Analysis

### User Stories: <covered>/<total> (<%>)

- [✅] User Story 1: Create New Task
- [✅] User Story 2: View Task List
- [✅] User Story 3: Mark Complete/Incomplete
- [✅] User Story 4: Update Task Details
- [✅] User Story 5: Delete Task

### Edge Cases: <covered>/<total> (<%>)

- [✅] Max length validation
- [✅] Missing required fields
- [✅] Network errors
- [✅] Concurrent operations
- [✅] Data isolation

### Success Criteria: <covered>/<total> (<%>)

All measurable success criteria from spec have corresponding tests.
```

## Error Handling

### Spec File Not Found
```
❌ Error: Feature specification not found

Searched locations:
- specs/features/<feature-name>/spec.md
- specs/<feature-name>/spec.md

Please provide a valid feature specification path.
Example: specs/features/task-management/spec.md
```

### Missing User Stories
```
⚠️ Warning: No user stories found in specification

The spec should include user stories with acceptance scenarios in Given/When/Then format.

Cannot generate comprehensive tests without user stories.
Please update the spec to include detailed acceptance scenarios.
```

### Incomplete API Contracts
```
⚠️ Warning: API contracts incomplete in specification

Missing information:
- Request/response schemas for POST /api/tasks
- Expected error status codes

Tests will be generated with placeholders marked as:
# TODO: Update with actual schema from spec

Please review and complete these sections.
```

## Quality Assurance Checklist

Before returning generated tests to user:
- [ ] All user stories have corresponding test cases
- [ ] Each test has clear docstring linking to user story
- [ ] Happy path and error cases both covered
- [ ] Authentication/authorization tests included where applicable
- [ ] Data isolation verified in tests
- [ ] Test file syntax is valid (Python/TypeScript)
- [ ] All imports are correct for the project structure
- [ ] Test data fixtures are properly defined
- [ ] Generated files follow project conventions
- [ ] Documentation accurately reflects generated tests
- [ ] Coverage percentage calculated correctly

## Notes

- **Test files are generated**, not overwritten. If files already exist, append `-generated` to filename to avoid conflicts
- **Manual customization encouraged**: Generated tests are a starting point. Add project-specific logic as needed.
- **Fixtures and mocks**: Adjust authentication fixtures and API mocks to match your actual authentication implementation
- **Database setup**: Backend tests use in-memory SQLite by default. Modify for your database if needed.
- **Async handling**: Frontend tests include proper async/await patterns for API calls
- **Accessibility**: E2E tests use accessible selectors (roles, labels) following best practices
