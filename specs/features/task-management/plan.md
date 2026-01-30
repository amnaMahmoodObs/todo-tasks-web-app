# Implementation Plan: Task Management

**Branch**: `002-task-management` | **Date**: 2026-01-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/features/task-management/spec.md`

## Summary

Implement full CRUD operations for task management in a multi-user todo application. Users can create, view, update (including toggling completion status), and delete their personal tasks. Each task has a required title (max 200 chars), optional description (max 1000 chars), and completion status (boolean). The system enforces strict user data isolation - users can only access their own tasks.

**Technical Approach**:
- **Backend**: FastAPI REST API with SQLModel ORM, JWT authentication middleware, and multi-layer user isolation
- **Frontend**: Next.js 16 App Router with Server Components for list views and Client Components for interactive forms
- **Database**: Neon PostgreSQL with tasks table (user_id foreign key, indexed for performance)
- **Validation**: Dual-layer (HTML5 frontend + Pydantic backend)

All technologies are already in use - no new dependencies required.

---

## Technical Context

**Language/Version**:
- Backend: Python 3.13+
- Frontend: TypeScript 5+, Node.js 20+

**Primary Dependencies**:
- Backend: FastAPI 0.128.0+, SQLModel 0.0.22+, PyJWT 2.10.1+, Psycopg2-binary 2.9.10+
- Frontend: Next.js 16.1.5+, React 19, Better Auth 1.3.8+, TypeScript 5+

**Storage**: Neon Serverless PostgreSQL (existing connection)

**Testing**: Manual testing with structured test plan (Phase II), automated tests in Phase III+

**Target Platform**:
- Backend: Linux/macOS server (Uvicorn ASGI)
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web (monorepo with separate frontend/backend)

**Performance Goals**:
- Task creation/view: < 2 seconds response time
- Task list rendering: < 1 second for 100 tasks
- Status toggle: < 1 second UI update
- 50+ concurrent operations without degradation

**Constraints**:
- User data isolation: 100% enforcement (no cross-user access)
- Stateless authentication via JWT (no server-side sessions)
- Last-write-wins concurrency (no optimistic locking in Phase II)
- Hard delete only (no soft delete/recovery)

**Scale/Scope**:
- Multi-user (10s-100s of users for Phase II)
- Unlimited tasks per user (pagination deferred to future)
- Single region deployment (Neon auto-scales)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ PASSED - Constitution Compliance

| Principle | Requirement | Compliance Status |
|-----------|-------------|-------------------|
| **I. Spec-Driven Development** | All code from specs, traceable artifacts | ✅ PASS: Spec created, plan generated, tasks will follow |
| **II. Monorepo Architecture** | Frontend/backend separation in monorepo | ✅ PASS: Using existing `frontend/` and `backend/` structure |
| **III. Layered CLAUDE.md** | Context files at root and subsystems | ✅ PASS: Root, frontend, and backend CLAUDE.md exist |
| **IV. Spec-Kit Plus Organization** | Specs in organized folders | ✅ PASS: Using `/specs/features/task-management/` |
| **V. Technology Stack Adherence** | Next.js 16+, FastAPI, SQLModel, Neon, Better Auth | ✅ PASS: No substitutions, all tech from constitution |
| **VI. RESTful API Design** | REST endpoints with JWT auth | ✅ PASS: 6 REST endpoints defined, JWT middleware exists |
| **VII. Security & Authentication First** | JWT verification, user isolation | ✅ PASS: Multi-layer isolation, JWT middleware reused |
| **VIII. Type Safety & Error Handling** | TypeScript + Pydantic, proper errors | ✅ PASS: Type hints, interfaces, HTTPException usage |

**No Constitution Violations** - All requirements met.

**Re-evaluation After Phase 1 Design**: ✅ PASSED
- Data model uses SQLModel with proper types
- API contracts follow RESTful conventions
- User isolation enforced at middleware, route, and query levels
- No architecture deviations introduced

---

## Project Structure

### Documentation (this feature)

```text
specs/features/task-management/
├── spec.md              # Feature specification (User input)
├── plan.md              # This file (Phase 0 & 1 output)
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model & validation
├── contracts/           # Phase 1 API contracts
│   └── task-api.yaml    # OpenAPI 3.0 spec for task endpoints
├── quickstart.md        # Phase 1 manual testing guide
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT YET CREATED)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                  # FastAPI app (MODIFY: add tasks router)
│   ├── config.py                # Configuration (NO CHANGES)
│   ├── db.py                    # Database connection (NO CHANGES)
│   ├── models.py                # SQLModel models (ADD: Task model)
│   ├── routes/
│   │   ├── auth.py              # Auth endpoints (NO CHANGES)
│   │   └── tasks.py             # NEW: Task CRUD endpoints
│   ├── services/
│   │   ├── auth_service.py      # Auth logic (NO CHANGES)
│   │   └── task_service.py      # NEW: Task business logic (optional)
│   └── middleware/
│       └── jwt_middleware.py    # JWT verification (NO CHANGES - reuse)
└── tests/
    ├── contract/                # NEW: API contract tests (future)
    └── integration/             # NEW: Integration tests (future)

frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx             # MODIFY: Add task list (Server Component)
│   ├── api/
│   │   └── auth/[...all]/route.ts  # Auth handler (NO CHANGES)
│   ├── layout.tsx               # Root layout (NO CHANGES)
│   └── globals.css              # Global styles (MINOR: task styles)
├── components/
│   ├── tasks/                   # NEW: Task components
│   │   ├── TaskList.tsx         # Client Component - task list container
│   │   ├── TaskItem.tsx         # Client Component - individual task
│   │   ├── TaskForm.tsx         # Client Component - create/edit form
│   │   └── TaskFormDialog.tsx   # Client Component - modal wrapper
│   ├── auth/                    # Auth components (NO CHANGES)
│   └── ui/                      # Generic UI (POSSIBLE: button, dialog components)
├── lib/
│   ├── auth.ts                  # Better Auth config (NO CHANGES)
│   ├── api-client.ts            # API client (ADD: task methods)
│   └── types.ts                 # TypeScript types (ADD: Task interface)
└── middleware.ts                # Route protection (NO CHANGES)
```

**Structure Decision**: Using existing web application structure (Option 2 from template). Frontend and backend are already established with authentication. Task management extends both sides with minimal new files:

- **Backend**: 1 new model, 1 new route file, optional 1 service file
- **Frontend**: 1 directory of 4 task components, additions to existing api-client and types

This structure maintains clear separation of concerns and follows established patterns.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - This section is not applicable. All constitution requirements are met without exceptions.

---

## Phase 0: Research & Technical Decisions

**Completed**: 2026-01-30
**Artifact**: [research.md](./research.md)

### Key Decisions Made

1. **API Design**: RESTful with explicit `user_id` in URL path (e.g., `/api/{user_id}/tasks`)
   - **Rationale**: Aligns with constitution, makes data ownership visible
   - **Alternative Rejected**: Implicit user_id from token only (less clear ownership)

2. **User Isolation**: Multi-layer enforcement (JWT middleware → route validation → query filtering)
   - **Rationale**: Defense in depth prevents accidental data leaks
   - **Alternative Rejected**: Single-layer application filtering (too easy to forget)

3. **Frontend Architecture**: Server Components for lists + Client Components for interactions
   - **Rationale**: Reduces JS bundle, better performance
   - **Alternative Rejected**: All Client Components (larger bundle) or SWR (unnecessary dependency)

4. **State Management**: React `useState` + `router.refresh()`
   - **Rationale**: Simple, no new dependencies needed
   - **Alternative Rejected**: Redux/Zustand (overkill for single-page CRUD)

5. **Validation Strategy**: Dual validation (HTML5 frontend + Pydantic backend)
   - **Rationale**: UX (immediate feedback) + security (authoritative backend check)
   - **Alternative Rejected**: Frontend-only (insecure) or backend-only (poor UX)

6. **Database Schema**: Normalized with composite indexes on `(user_id, completed)`
   - **Rationale**: Supports filtered queries efficiently
   - **Alternative Rejected**: UUID primary keys (unnecessary complexity)

7. **Testing**: Manual testing with structured test plan
   - **Rationale**: Constitution permits manual tests for Phase II
   - **Alternative Rejected**: Automated tests (deferred to Phase III)

### No New Dependencies Required

All technologies already in use:
- Backend: FastAPI, SQLModel, PyJWT, Psycopg2, Uvicorn
- Frontend: Next.js 16, React 19, TypeScript, Tailwind, Better Auth

---

## Phase 1: Data Model & API Contracts

**Completed**: 2026-01-30
**Artifacts**:
- [data-model.md](./data-model.md)
- [contracts/task-api.yaml](./contracts/task-api.yaml)
- [quickstart.md](./quickstart.md)

### Data Model Summary

**Task Entity**:

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | Integer (SERIAL) | Primary key, auto-increment | Unique identifier |
| `user_id` | String (VARCHAR 255) | Foreign key to users.id, NOT NULL, indexed | Owner reference |
| `title` | String (VARCHAR 200) | NOT NULL, 1-200 chars | Task title |
| `description` | Text | Nullable, max 1000 chars | Optional details |
| `completed` | Boolean | NOT NULL, default false, indexed | Completion status |
| `created_at` | Timestamp | NOT NULL, auto-set | Creation time |
| `updated_at` | Timestamp | NOT NULL, auto-update | Last modification time |

**Relationships**:
- Task → User: Many-to-one (foreign key with ON DELETE CASCADE)

**Indexes**:
- Primary key on `id` (automatic)
- Index on `user_id` (for user filtering)
- Composite index on `(user_id, completed)` (for filtered queries)

**Validation Rules**:
- Backend (Pydantic): `min_length=1`, `max_length=200` for title; `max_length=1000` for description; custom validator to strip whitespace
- Frontend (HTML5): `required`, `minLength={1}`, `maxLength={200}` for title; `maxLength={1000}` for description

### API Contract Summary

**6 REST Endpoints**:

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/{user_id}/tasks` | List all user tasks | None | `{ tasks: Task[], count: number }` |
| POST | `/api/{user_id}/tasks` | Create new task | `TaskCreate` | `Task` (201) |
| GET | `/api/{user_id}/tasks/{task_id}` | Get task by ID | None | `Task` |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task details | `TaskUpdate` | `Task` |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task | None | 204 No Content |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion | None | `Task` |

**Authentication**: All endpoints require JWT token in `Authorization: Bearer <token>` header

**Error Responses**:
- 400 Bad Request: Validation errors (Pydantic detail array)
- 401 Unauthorized: Missing/invalid/expired JWT token
- 403 Forbidden: User ID mismatch between JWT and URL
- 404 Not Found: Task doesn't exist or not owned by user

**See**: [contracts/task-api.yaml](./contracts/task-api.yaml) for full OpenAPI 3.0 specification

### Agent Context Update

**Status**: Skipped (user decision)

No new technologies introduced, so agent context files (CLAUDE.md) do not require updates.

---

## Implementation Approach

### Backend Implementation Strategy

**Step 1: Define Task Model** (`src/models.py`)
- Add `Task` SQLModel class with all fields and relationships
- Ensure proper type hints and docstrings
- Define Pydantic models: `TaskCreate`, `TaskUpdate`, `TaskResponse`

**Step 2: Create Task Router** (`src/routes/tasks.py`)
- Define APIRouter with `/api/{user_id}/tasks` prefix
- Implement 6 endpoints (GET list, POST create, GET by ID, PUT update, DELETE, PATCH complete)
- Inject database session via `Depends(get_session)`
- Access authenticated user from `request.state.user_id`
- Validate URL `user_id` matches JWT `user_id` (raise 403 if mismatch)
- Filter all queries by `user_id`

**Step 3: Register Router** (`src/main.py`)
- Import tasks router
- Register with `app.include_router(tasks.router)`

**Step 4: Create Database Migration**
- Run SQLModel metadata creation or write SQL migration
- Create `tasks` table with indexes
- Verify foreign key constraint to `users` table

**Key Patterns**:
```python
# User isolation check (every endpoint)
if request.state.user_id != user_id:
    raise HTTPException(status_code=403, detail="Access denied")

# Query filtering (every database query)
tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()

# 404 for missing resources (prevents user enumeration)
if not task:
    raise HTTPException(status_code=404, detail="Task not found")
```

### Frontend Implementation Strategy

**Step 1: Define TypeScript Types** (`lib/types.ts`)
- Add `Task` interface matching backend model
- Add `TaskCreate` and `TaskUpdate` types

**Step 2: Extend API Client** (`lib/api-client.ts`)
- Add 6 methods: `getTasks()`, `createTask()`, `getTask()`, `updateTask()`, `deleteTask()`, `toggleTaskComplete()`
- Each method includes JWT token from Better Auth session
- Handle errors and return structured responses

**Step 3: Create Task Components** (`components/tasks/`)
- **TaskList.tsx**: Client Component, receives tasks array, renders TaskItem components
- **TaskItem.tsx**: Client Component, displays task, handles complete toggle, delete
- **TaskForm.tsx**: Client Component, form for create/edit with validation
- **TaskFormDialog.tsx**: Client Component, modal wrapper (optional, can use inline form)

**Step 4: Update Dashboard Page** (`app/dashboard/page.tsx`)
- Server Component: Fetch tasks on server-side
- Pass tasks to TaskList Client Component
- Handle empty state ("No tasks yet")

**Step 5: Add Styles** (`app/globals.css` or inline Tailwind)
- Completed task styles (opacity, strikethrough)
- Form styles (inputs, buttons, error messages)
- Responsive layout

**Key Patterns**:
```typescript
// Server Component data fetching
export default async function DashboardPage() {
  const tasks = await getTasks(userId);  // Server-side fetch
  return <TaskList tasks={tasks} />;
}

// Client Component with state
'use client';
export function TaskForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    await onSubmit({ title, description });
    router.refresh();  // Refetch server data
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Security Considerations

### Multi-Layer User Isolation

**Layer 1: JWT Middleware** (existing, no changes)
- Verifies JWT signature with `BETTER_AUTH_SECRET`
- Decodes token and injects `request.state.user_id`
- Returns 401 if token missing, invalid, or expired

**Layer 2: Route Parameter Validation** (implement in each task endpoint)
- Compare `request.state.user_id` (from JWT) with `user_id` (from URL)
- Return 403 Forbidden if mismatch
- Prevents authenticated user from accessing another user's tasks via URL manipulation

**Layer 3: Database Query Filtering** (implement in each database query)
- Always include `WHERE user_id = <authenticated_user_id>`
- Never return tasks without user_id filter
- Use indexed column for performance

**Layer 4: Response Scrubbing** (implement in error handling)
- Return 404 "Task not found" instead of 403 when task doesn't exist for user
- Prevents user enumeration (attacker can't determine if task ID exists for another user)

### Validation Security

**Backend (Authoritative)**:
- Pydantic models validate all inputs
- Custom validators strip whitespace and check emptiness
- Length constraints enforced (title ≤ 200, description ≤ 1000)
- Never trust client-sent data

**Frontend (UX)**:
- HTML5 attributes provide immediate feedback
- JavaScript validation catches errors before submission
- NOT relied upon for security (can be bypassed)

### SQL Injection Prevention

- SQLModel uses parameterized queries (automatic protection)
- No raw SQL strings concatenated with user input
- ORM handles escaping and prepared statements

---

## Performance Optimization

### Database Performance

**Indexes**:
- `idx_tasks_user_id`: Speeds up all user-specific queries (most common)
- `idx_tasks_user_completed`: Composite index for filtered queries (future filtering feature)

**Connection Pooling**:
- Neon PostgreSQL auto-scales connections
- SQLModel session management prevents connection leaks

**Query Patterns**:
- Use `SELECT *` only when all fields needed
- Limit results if pagination added in future
- Avoid N+1 queries (not applicable with flat task list)

### Frontend Performance

**Bundle Size**:
- Server Components reduce client JS (task list rendered server-side)
- Client Components only where interactivity needed (forms, buttons)

**Data Fetching**:
- Server-side fetch in page component (parallel with HTML streaming)
- `cache: 'no-store'` ensures fresh data on navigation
- `router.refresh()` after mutations re-fetches server data

**Rendering**:
- Virtual scrolling deferred to future (not needed for 100 tasks)
- React key prop on task items for efficient reconciliation

---

## Testing Strategy

### Manual Testing (Phase II)

**Test Plan**: See [quickstart.md](./quickstart.md) for detailed test procedures

**Test Coverage**:
1. **User Story 1 (P1)**: Create task (6 test cases)
2. **User Story 2 (P2)**: View tasks (4 test cases)
3. **User Story 3 (P3)**: Toggle completion (4 test cases)
4. **User Story 4 (P4)**: Update task (6 test cases)
5. **User Story 5 (P5)**: Delete task (3 test cases)
6. **Edge Cases**: 5 test cases (network errors, token expiration, URL manipulation, etc.)
7. **Performance**: 2 test cases (100 tasks, concurrent operations)

**Validation Checklist**:
- 10 Success Criteria (SC-001 to SC-010)
- 20 Functional Requirements (FR-001 to FR-020)

**Tools**:
- Browser for UI testing
- Curl for API testing
- Database queries for data verification

### Automated Testing (Phase III+)

Deferred to future phases:
- Contract tests (API endpoint validation)
- Integration tests (full user journeys)
- Unit tests (business logic)
- E2E tests (Playwright/Cypress)

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Performance degradation with large task lists | Medium | Low | Indexed queries; pagination in future |
| Concurrent updates causing data loss | Low | Low | Last-write-wins acceptable for Phase II; add optimistic locking later |
| JWT token expiration during session | Low | Medium | Frontend handles 401, redirects to login; consider refresh tokens in Phase III |
| Database connection pool exhaustion | Low | Low | Neon auto-scales; monitor connection usage |
| User data leak via query bug | High | Low | Multi-layer isolation; code review; manual testing of access control |
| Validation bypass via API calls | Medium | Low | Backend validation authoritative; never trust client |

---

## Future Enhancements (Out of Scope for Phase II)

1. **Pagination**: Load tasks in pages of 50-100 for better performance
2. **Filtering**: Show only complete/incomplete tasks
3. **Sorting**: Order by title, date, completion status
4. **Search**: Find tasks by keyword in title/description
5. **Tags/Categories**: Organize tasks into groups
6. **Due Dates**: Set deadlines with reminders
7. **Subtasks**: Break tasks into smaller items
8. **Collaboration**: Share tasks with other users
9. **Real-time Sync**: WebSocket updates across devices
10. **Optimistic UI Updates**: Update UI before server response (with rollback on error)

---

## Acceptance Criteria

### Definition of Done

Implementation is complete when:

✅ **Backend**:
- [ ] Task model defined in `src/models.py` with all fields
- [ ] 6 API endpoints implemented in `src/routes/tasks.py`
- [ ] Router registered in `src/main.py`
- [ ] Database migration creates `tasks` table with indexes
- [ ] User isolation enforced in all endpoints (JWT check + query filter)
- [ ] Validation returns appropriate error messages
- [ ] All HTTP status codes correct (200, 201, 204, 400, 401, 403, 404)

✅ **Frontend**:
- [ ] Task types defined in `lib/types.ts`
- [ ] API client methods added to `lib/api-client.ts`
- [ ] Task components created in `components/tasks/`
- [ ] Dashboard page displays task list
- [ ] Create task form functional with validation
- [ ] Edit task form functional with validation
- [ ] Toggle completion functional
- [ ] Delete task functional with confirmation
- [ ] Empty state displayed when no tasks
- [ ] Error messages displayed for validation and network failures
- [ ] Visual distinction for completed tasks

✅ **Testing**:
- [ ] All 10 Success Criteria validated (see quickstart.md checklist)
- [ ] All 20 Functional Requirements validated
- [ ] All priority user stories tested (P1-P5)
- [ ] Edge cases tested (7 scenarios)
- [ ] Performance tested (100 tasks, concurrent operations)
- [ ] Data isolation verified (cannot access other users' tasks)

✅ **Documentation**:
- [ ] Spec, plan, research, data-model, contracts, quickstart all complete
- [ ] Code comments and docstrings added
- [ ] No placeholder or TODO comments remaining
- [ ] CLAUDE.md files reviewed (no updates needed)

---

## Next Steps

1. **Generate Task Breakdown**: Run `/sp.tasks` to create `tasks.md` with dependency-ordered implementation steps
2. **Implement**: Run `/sp.implement` to execute tasks (or implement manually following this plan)
3. **Test**: Follow [quickstart.md](./quickstart.md) test procedures
4. **Iterate**: If issues found, refine spec and regenerate plan (do not manually fix code)
5. **Document Decisions**: If architecturally significant decisions made, create ADR via `/sp.adr`
6. **Create PHR**: Record this planning session in Prompt History Record

---

**Plan Status**: ✅ COMPLETE
**Date**: 2026-01-30
**Ready for**: Task breakdown (`/sp.tasks`)
