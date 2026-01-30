





# Tasks: Task Management

**Input**: Design documents from `/specs/features/task-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/task-api.yaml
**Branch**: `002-task-management`
**Date**: 2026-01-30

**Tests**: Manual testing only (as specified in constitution for Phase II). No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This is a **web app monorepo** with:
- **Backend**: `backend/src/` (FastAPI + Python)
- **Frontend**: `frontend/` (Next.js 16 + TypeScript)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema setup

- [ ] T001 Create database migration for tasks table with indexes in backend/migrations/ (or apply via SQLModel)
- [ ] T002 [P] Verify environment variables in backend/.env (DATABASE_URL, BETTER_AUTH_SECRET)
- [ ] T003 [P] Verify environment variables in frontend/.env.local (NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, DATABASE_URL)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Task model and shared infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create Task SQLModel in backend/src/models.py with all fields (id, user_id, title, description, completed, created_at, updated_at)
- [ ] T005 Create Pydantic models (TaskCreate, TaskUpdate, TaskResponse) in backend/src/models.py with validators
- [ ] T006 [P] Create TypeScript Task interface in frontend/lib/types.ts
- [ ] T007 Run database migration to create tasks table with foreign key and indexes
- [ ] T008 [P] Create API client placeholder functions in frontend/lib/api-client.ts (getTasks, createTask, getTask, updateTask, deleteTask, toggleTaskComplete)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Task (Priority: P1) 🎯 MVP

**Goal**: Allow authenticated users to create a new task with title and optional description, defaulting to incomplete status

**Independent Test**: Log in, create a task with a title, verify it appears in the task list (requires US2 for full verification, but creation endpoint can be tested directly via curl/API)

### Backend Implementation for User Story 1

- [ ] T009 [P] [US1] Create tasks router file in backend/src/routes/tasks.py with APIRouter setup
- [ ] T010 [US1] Implement POST /api/{user_id}/tasks endpoint in backend/src/routes/tasks.py (create task)
- [ ] T011 [US1] Add user isolation validation (JWT user_id vs URL user_id) in POST endpoint
- [ ] T012 [US1] Add input validation and error handling (400, 401, 403) in POST endpoint
- [ ] T013 [US1] Register tasks router in backend/src/main.py

### Frontend Implementation for User Story 1

- [ ] T014 [P] [US1] Implement createTask function in frontend/lib/api-client.ts (POST request with JWT)
- [ ] T015 [P] [US1] Create TaskForm component in frontend/components/tasks/TaskForm.tsx (Client Component with title/description inputs)
- [ ] T016 [US1] Add HTML5 validation to TaskForm (required, minLength=1, maxLength=200 for title, maxLength=1000 for description)
- [ ] T017 [US1] Add client-side validation and error display in TaskForm.tsx
- [ ] T018 [US1] Create TaskFormDialog component in frontend/components/tasks/TaskFormDialog.tsx (modal wrapper for TaskForm)
- [ ] T019 [US1] Add TaskFormDialog to dashboard page in frontend/app/dashboard/page.tsx (Server Component integration)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create tasks via the UI

---

## Phase 4: User Story 2 - View Task List (Priority: P2)

**Goal**: Allow authenticated users to see all their tasks, with proper data isolation (users only see their own tasks)

**Independent Test**: Create multiple tasks, verify all are displayed; test with multiple user accounts to verify data isolation

### Backend Implementation for User Story 2

- [ ] T020 [P] [US2] Implement GET /api/{user_id}/tasks endpoint in backend/src/routes/tasks.py (list all tasks)
- [ ] T021 [US2] Add user isolation filtering (WHERE user_id = authenticated_user_id) in GET list endpoint
- [ ] T022 [US2] Add ordering by created_at DESC (newest first) in GET list endpoint
- [ ] T023 [US2] Return task count and tasks array in response format

### Frontend Implementation for User Story 2

- [ ] T024 [P] [US2] Implement getTasks function in frontend/lib/api-client.ts (GET request with JWT)
- [ ] T025 [P] [US2] Create TaskItem component in frontend/components/tasks/TaskItem.tsx (Client Component displaying single task)
- [ ] T026 [P] [US2] Create TaskList component in frontend/components/tasks/TaskList.tsx (Client Component rendering array of TaskItem)
- [ ] T027 [US2] Fetch tasks server-side in frontend/app/dashboard/page.tsx and pass to TaskList
- [ ] T028 [US2] Add empty state message "No tasks yet. Create your first task!" in TaskList.tsx
- [ ] T029 [US2] Add styling for completed tasks (opacity, strikethrough) in frontend/app/globals.css or TaskItem.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can create and view tasks

---

## Phase 5: User Story 3 - Mark Task as Complete/Incomplete (Priority: P3)

**Goal**: Allow users to toggle task completion status with visual feedback and persistence

**Independent Test**: Create a task, mark it complete, verify UI updates and status persists on reload; mark it incomplete again

### Backend Implementation for User Story 3

- [ ] T030 [P] [US3] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/src/routes/tasks.py
- [ ] T031 [US3] Add toggle logic (completed = NOT completed) in PATCH endpoint
- [ ] T032 [US3] Add user isolation check (task.user_id == authenticated_user_id) in PATCH endpoint
- [ ] T033 [US3] Update updated_at timestamp automatically on completion toggle
- [ ] T034 [US3] Return 404 if task not found or not owned by user

### Frontend Implementation for User Story 3

- [ ] T035 [P] [US3] Implement toggleTaskComplete function in frontend/lib/api-client.ts (PATCH request)
- [ ] T036 [US3] Add toggle completion button/checkbox to TaskItem.tsx (onClick handler)
- [ ] T037 [US3] Add optimistic UI update (immediate visual feedback) in TaskItem.tsx
- [ ] T038 [US3] Call router.refresh() after successful toggle to refetch server data
- [ ] T039 [US3] Add error handling for failed toggle requests

**Checkpoint**: All core functionality complete - users can create, view, and complete tasks

---

## Phase 6: User Story 4 - Update Task Details (Priority: P4)

**Goal**: Allow users to edit task title and description with validation

**Independent Test**: Create a task, edit its title and description, verify changes are saved and displayed

### Backend Implementation for User Story 4

- [ ] T040 [P] [US4] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/routes/tasks.py
- [ ] T041 [US4] Add validation for updated title (min_length=1, max_length=200, not whitespace-only)
- [ ] T042 [US4] Add validation for updated description (max_length=1000)
- [ ] T043 [US4] Add user isolation check in PUT endpoint
- [ ] T044 [US4] Update updated_at timestamp automatically on edit
- [ ] T045 [US4] Preserve created_at timestamp (do not modify)
- [ ] T046 [US4] Return 404 if task not found or not owned by user

### Frontend Implementation for User Story 4

- [ ] T047 [P] [US4] Implement updateTask function in frontend/lib/api-client.ts (PUT request)
- [ ] T048 [US4] Add edit mode toggle to TaskItem.tsx (show form vs display mode)
- [ ] T049 [US4] Add inline editing form in TaskItem.tsx with pre-filled values
- [ ] T050 [US4] Add validation to edit form (same rules as create)
- [ ] T051 [US4] Call updateTask and router.refresh() on save
- [ ] T052 [US4] Add cancel button to revert to display mode without saving
- [ ] T053 [US4] Add error handling for validation failures and network errors

**Checkpoint**: Full task editing functional - users can modify task details

---

## Phase 7: User Story 5 - Delete Task (Priority: P5)

**Goal**: Allow users to permanently delete tasks with confirmation to prevent accidental deletion

**Independent Test**: Create a task, delete it with confirmation, verify it no longer appears in the list and is removed from database

### Backend Implementation for User Story 5

- [ ] T054 [P] [US5] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/src/routes/tasks.py
- [ ] T055 [US5] Add user isolation check in DELETE endpoint
- [ ] T056 [US5] Hard delete task from database (no soft delete)
- [ ] T057 [US5] Return 204 No Content on successful deletion
- [ ] T058 [US5] Return 404 if task not found or not owned by user

### Frontend Implementation for User Story 5

- [ ] T059 [P] [US5] Implement deleteTask function in frontend/lib/api-client.ts (DELETE request)
- [ ] T060 [US5] Add delete button to TaskItem.tsx
- [ ] T061 [US5] Add confirmation dialog before deletion (using window.confirm or custom modal)
- [ ] T062 [US5] Call deleteTask and router.refresh() after confirmation
- [ ] T063 [US5] Add error handling for failed deletion

**Checkpoint**: All user stories complete - full CRUD operations functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T064 [P] Add GET /api/{user_id}/tasks/{task_id} endpoint in backend/src/routes/tasks.py (get single task - used for future detail views)
- [ ] T065 [P] Add responsive styling for mobile/tablet in frontend/app/globals.css
- [ ] T066 [P] Add loading states to all frontend components (spinner/skeleton during API calls)
- [ ] T067 [P] Improve error messages for all validation failures (user-friendly text)
- [ ] T068 [P] Add proper CORS headers verification in backend/src/main.py
- [ ] T069 Review all endpoints for consistent HTTP status codes (200, 201, 204, 400, 401, 403, 404)
- [ ] T070 Test all edge cases from spec.md (max length title, max length description, network failures, concurrent updates, URL manipulation)
- [ ] T071 Verify all 10 Success Criteria (SC-001 to SC-010) from spec.md
- [ ] T072 Verify all 20 Functional Requirements (FR-001 to FR-020) from spec.md
- [ ] T073 Run complete manual test plan from specs/features/task-management/quickstart.md
- [ ] T074 Fix any issues discovered during testing
- [ ] T075 [P] Code cleanup and remove any TODO comments
- [ ] T076 [P] Add code comments and docstrings where needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if team has capacity)
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Foundational - Best tested with US1 tasks created, but can work independently
- **User Story 3 (P3)**: Depends on Foundational + US2 (needs tasks visible to toggle) - Can work independently
- **User Story 4 (P4)**: Depends on Foundational + US2 (needs tasks visible to edit) - Can work independently
- **User Story 5 (P5)**: Depends on Foundational + US2 (needs tasks visible to delete) - Can work independently

**NOTE**: While US3, US4, US5 benefit from US2 for UI visibility, their backend endpoints are independent and can be developed in parallel.

### Within Each User Story

- Backend endpoints before frontend API client integration
- API client functions before UI components that use them
- Base components (TaskForm, TaskItem) before container components (TaskFormDialog, TaskList)
- Core implementation before error handling and edge cases

### Parallel Opportunities

#### Phase 1 (Setup)
All 3 tasks (T001-T003) can run in parallel

#### Phase 2 (Foundational)
- T006, T008 (frontend) can run in parallel with T004, T005, T007 (backend)

#### Phase 3 (User Story 1)
- T009 (backend router file) parallel with T014, T015 (frontend components)
- T014, T015 can run in parallel (different files)

#### Phase 4 (User Story 2)
- T020 (backend) parallel with T024, T025, T026 (frontend)
- T024, T025, T026 can run in parallel (different files)

#### Phase 5 (User Story 3)
- T030 (backend) parallel with T035 (frontend API client)

#### Phase 6 (User Story 4)
- T040 (backend) parallel with T047 (frontend API client)

#### Phase 7 (User Story 5)
- T054 (backend) parallel with T059 (frontend API client)

#### Phase 8 (Polish)
Most tasks marked [P] can run in parallel (T064-T068, T075-T076)

#### Across User Stories (if team has capacity)
After Foundational phase completes, different developers can work on:
- Developer A: User Story 1 (T009-T019)
- Developer B: User Story 2 (T020-T029)
- Developer C: User Story 3 (T030-T039)

---

## Parallel Example: User Story 1 (Backend + Frontend)

```bash
# Parallel batch 1: Create router file and frontend components
Task T009: "Create tasks router file in backend/src/routes/tasks.py"
Task T014: "Implement createTask function in frontend/lib/api-client.ts"
Task T015: "Create TaskForm component in frontend/components/tasks/TaskForm.tsx"

# Parallel batch 2: After backend endpoint is complete
Task T010: "Implement POST endpoint" (backend)
Task T016: "Add HTML5 validation to TaskForm" (frontend)
Task T017: "Add client-side validation" (frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008) - CRITICAL, blocks everything
3. Complete Phase 3: User Story 1 (T009-T019) - Create tasks
4. Complete Phase 4: User Story 2 (T020-T029) - View tasks
5. **STOP and VALIDATE**: Test create + view workflow end-to-end
6. Deploy/demo MVP (users can add and see tasks)

This gives you a **minimal but usable product** in ~30 tasks.

### Incremental Delivery

1. Setup + Foundational (T001-T008) → Foundation ready
2. Add User Story 1 (T009-T019) → Test independently → Can create tasks
3. Add User Story 2 (T020-T029) → Test independently → Can view tasks → **Deploy MVP!**
4. Add User Story 3 (T030-T039) → Test independently → Can complete tasks → Deploy
5. Add User Story 4 (T040-T053) → Test independently → Can edit tasks → Deploy
6. Add User Story 5 (T054-T063) → Test independently → Can delete tasks → Deploy
7. Polish (T064-T076) → Final validation → Production ready

Each story adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Team completes Setup + Foundational together** (T001-T008)
2. **Once Foundational is done, split work:**
   - Developer A: User Story 1 (T009-T019)
   - Developer B: User Story 2 (T020-T029)
   - Developer C: User Story 3 (T030-T039) + User Story 5 (T054-T063)
   - Developer D: User Story 4 (T040-T053)
3. Stories complete and integrate independently
4. Merge and test integration
5. Team tackles Polish together (T064-T076)

---

## Task Summary

**Total Tasks**: 76

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (User Story 1 - Create): 11 tasks
- Phase 4 (User Story 2 - View): 10 tasks
- Phase 5 (User Story 3 - Complete): 10 tasks
- Phase 6 (User Story 4 - Update): 14 tasks
- Phase 7 (User Story 5 - Delete): 10 tasks
- Phase 8 (Polish): 13 tasks

**Tasks by User Story**:
- US1 (Create Task): 11 implementation tasks
- US2 (View Tasks): 10 implementation tasks
- US3 (Toggle Complete): 10 implementation tasks
- US4 (Update Task): 14 implementation tasks
- US5 (Delete Task): 10 implementation tasks

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel with other tasks

**MVP Scope (Recommended)**: Phases 1-4 (T001-T029) = 29 tasks
- Delivers: Create and View tasks (core value proposition)
- Can be completed and deployed quickly
- Provides foundation for remaining stories

**Independent Test Criteria**:
- US1: Create a task via UI/API, verify it exists in database
- US2: Create multiple tasks, view list, verify all displayed, test data isolation
- US3: Toggle task completion, verify status changes and persists
- US4: Edit task details, verify changes saved
- US5: Delete task with confirmation, verify removed from list and database

---

## Notes

- All tasks follow strict checkbox format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] = Parallelizable (different files, no blocking dependencies)
- [Story] = User story label (US1, US2, US3, US4, US5) for traceability
- No automated tests included (manual testing per constitution Phase II)
- Each user story is independently completable and testable
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Backend uses FastAPI + SQLModel + JWT middleware (already exists)
- Frontend uses Next.js 16 App Router + Better Auth + Server/Client Components
- Database: Neon PostgreSQL (connection already configured)

**Ready for Implementation**: Run `/sp.implement` or implement manually following this task list
