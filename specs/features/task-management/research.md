# Research Report: Task Management Feature

**Feature Branch**: `002-task-management`
**Date**: 2026-01-30
**Purpose**: Technical research to resolve unknowns and inform implementation decisions

## 1. Task CRUD API Design with FastAPI + SQLModel

### Decision: RESTful API with SQLModel ORM

**Approach**:
- Use FastAPI's dependency injection for database sessions
- SQLModel for type-safe database operations
- Pydantic models for request/response validation
- Follow REST conventions aligned with constitution

**API Endpoints** (from Constitution Section VI):
```
GET    /api/{user_id}/tasks           # List all tasks
POST   /api/{user_id}/tasks           # Create new task
GET    /api/{user_id}/tasks/{id}      # Get task details
PUT    /api/{user_id}/tasks/{id}      # Update task
DELETE /api/{user_id}/tasks/{id}      # Delete task
PATCH  /api/{user_id}/tasks/{id}/complete  # Toggle completion
```

**Rationale**:
- SQLModel provides type safety and aligns with existing backend patterns
- Dependency injection enables testability and clean code
- REST conventions are well-understood and standard
- Explicit `user_id` in URL enforces data isolation visibility

**Alternatives Considered**:
- **Raw SQL with Psycopg**: Rejected - loses type safety and increases boilerplate
- **GraphQL**: Rejected - violates constitution (RESTful requirement)
- **Implicit user_id from token only**: Rejected - URL pattern matches constitution

**Implementation Pattern**:
```python
# SQLModel with relationships
class Task(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Route with dependency injection
@router.post("/api/{user_id}/tasks", response_model=TaskResponse)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    request: Request,
    session: Session = Depends(get_session)
):
    # Verify user_id from JWT matches URL
    if request.state.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Create task
    task = Task(**task_data.dict(), user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

---

## 2. User Isolation & Data Security Patterns

### Decision: Multi-layer isolation enforcement

**Approach**:
1. **JWT Middleware Layer**: Extract and verify user_id from token
2. **Route Parameter Validation**: Match JWT user_id with URL user_id
3. **Database Query Filtering**: Always include `WHERE user_id = <authenticated_user>`
4. **Response Scrubbing**: Never reveal existence of other users' data

**Security Pattern**:
```python
# Layer 1: JWT Middleware (existing)
# Injects request.state.user_id

# Layer 2: Route parameter check
if request.state.user_id != user_id:
    raise HTTPException(status_code=403, detail="Access denied")

# Layer 3: Database query filtering
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .where(Task.id == task_id)  # Additional filters
).first()

# Layer 4: 404 instead of 403 when resource not found
if not tasks:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Rationale**:
- Defense in depth: multiple layers prevent accidental data leaks
- 404 responses prevent user enumeration attacks
- Indexed user_id ensures query performance at scale
- Follows constitution's strict user isolation requirement

**Alternatives Considered**:
- **Application-level user context**: Rejected - too easy to forget in new routes
- **Database row-level security**: Rejected - adds complexity for Phase II
- **Trust client-sent user_id**: Rejected - security violation

---

## 3. Better Auth JWT Integration

### Decision: Verify JWT in middleware, extract user context

**Current State**:
- Better Auth issues JWT tokens on frontend
- Backend has JWT verification middleware in `src/middleware/jwt_middleware.py`
- Shared secret in `BETTER_AUTH_SECRET` environment variable

**Task Management Integration**:
- Reuse existing middleware (no changes needed)
- Access `request.state.user_id` in all task routes
- Validate URL parameter matches token user_id

**Token Payload Structure** (from Better Auth JWT plugin):
```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Verification Flow**:
1. Client sends: `Authorization: Bearer <jwt-token>`
2. Middleware extracts token and verifies signature
3. Middleware decodes and checks expiration
4. Middleware injects `request.state.user_id` and `request.state.email`
5. Route handlers access authenticated user via `request.state`

**Rationale**:
- Existing middleware already implements this pattern
- No additional dependencies or code needed
- Stateless authentication aligns with constitution

---

## 4. Frontend Task UI Patterns with Next.js 16

### Decision: Server Components for list, Client Components for interactions

**Architecture**:
- **Task List Page**: Server Component (default, faster initial load)
- **Task Form**: Client Component (`'use client'` - needs form state)
- **Task Item**: Client Component (needs onClick handlers for complete/delete)
- **API Client**: Centralized in `lib/api-client.ts`

**State Management Strategy**:
- **Server-side**: Fetch tasks in Server Component `page.tsx`
- **Client-side**: Use React `useState` for optimistic UI updates
- **Refetch**: Use `router.refresh()` after mutations to re-fetch server data
- **No global state needed**: Single-page task list doesn't warrant Redux/Zustand

**Component Structure**:
```
app/
├── dashboard/
│   └── page.tsx                 # Server Component - fetch and render tasks
│
components/
├── tasks/
│   ├── TaskList.tsx             # Client Component - receives tasks as props
│   ├── TaskItem.tsx             # Client Component - individual task with actions
│   ├── TaskForm.tsx             # Client Component - create/edit form
│   └── TaskFormDialog.tsx       # Client Component - modal wrapper
```

**API Client Pattern**:
```typescript
// lib/api-client.ts
export async function getTasks(userId: string): Promise<Task[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/${userId}/tasks`,
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Always fetch fresh data
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  return response.json();
}

export async function createTask(
  userId: string,
  data: TaskCreate
): Promise<Task> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/${userId}/tasks`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create task');
  }

  return response.json();
}
```

**Rationale**:
- Server Components reduce JavaScript bundle size
- Client Components only where interactivity needed
- `router.refresh()` is simpler than complex state management for Phase II
- Centralized API client follows existing pattern from auth

**Alternatives Considered**:
- **All Client Components**: Rejected - increases bundle size unnecessarily
- **SWR/React Query**: Rejected - overkill for simple CRUD, adds dependency
- **Global state (Redux/Zustand)**: Rejected - single page doesn't need it

---

## 5. Validation Strategy (Frontend + Backend)

### Decision: Dual validation with Pydantic backend, native HTML5 frontend

**Backend Validation** (authoritative):
```python
from pydantic import BaseModel, Field, validator

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

    @validator('title')
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

    @validator('title')
    def title_valid_if_present(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip() if v else v
```

**Frontend Validation** (user experience):
```typescript
// components/tasks/TaskForm.tsx
<input
  type="text"
  required
  minLength={1}
  maxLength={200}
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Task title (required)"
/>

<textarea
  maxLength={1000}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Optional description"
/>

{error && <p className="text-red-500">{error}</p>}
```

**Rationale**:
- Backend validation is authoritative (never trust client)
- Frontend validation provides immediate feedback (better UX)
- Pydantic provides automatic validation error messages
- HTML5 attributes are zero-dependency validation

**Alternatives Considered**:
- **Frontend-only validation**: Rejected - security vulnerability
- **Zod/Yup on frontend**: Rejected - adds dependency, HTML5 sufficient for Phase II
- **Backend-only validation**: Rejected - poor user experience (round-trip for errors)

---

## 6. Error Handling & User Feedback

### Decision: Structured error responses with user-friendly messages

**Backend Error Format**:
```python
# Validation error (400)
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at most 200 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}

# Business logic error (custom)
{
  "error": "Task not found",
  "code": "TASK_NOT_FOUND",
  "detail": "Task with ID 5 does not exist for this user"
}
```

**Frontend Error Handling**:
```typescript
try {
  await createTask(userId, taskData);
  router.refresh(); // Refetch tasks
  setShowForm(false);
} catch (error) {
  if (error instanceof Error) {
    // Parse backend error
    const message = error.message || 'An error occurred';
    setError(message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

**Rationale**:
- FastAPI returns Pydantic validation errors automatically
- Custom errors use consistent format (from constitution)
- Frontend displays errors inline for better UX
- Never expose stack traces or sensitive details

---

## 7. Database Schema Design

### Decision: Simple normalized schema with indexes

**Tasks Table Schema**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

**SQLModel Definition**:
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
```

**Rationale**:
- Composite index on `(user_id, completed)` supports filtered queries
- `ON DELETE CASCADE` ensures orphaned tasks are cleaned up
- `updated_at` with `onupdate` automatically tracks modifications
- Serial primary key is simple and sufficient for Phase II

**Alternatives Considered**:
- **UUID primary keys**: Rejected - unnecessary complexity for Phase II
- **Soft delete with deleted_at**: Rejected - out of scope per spec
- **Separate user_tasks join table**: Rejected - one-to-many is sufficient

---

## 8. Testing Strategy for Phase II

### Decision: Manual testing with structured test cases

**Manual Test Plan** (from spec success criteria):
1. **Create Task**: Verify task appears in list within 2 seconds
2. **View Tasks**: Load list of 100 tasks in under 1 second
3. **Toggle Completion**: Status updates within 1 second
4. **Update Task**: Changes persist across page refresh
5. **Delete Task**: Task removed and doesn't reappear
6. **Data Isolation**: Cannot access other users' tasks
7. **Validation**: Empty title rejected, 200+ char title rejected

**Test Data Setup**:
```bash
# Create test users
curl -X POST http://localhost:8000/api/auth/signup \
  -d '{"email":"user1@test.com","password":"testpass123"}'
curl -X POST http://localhost:8000/api/auth/signup \
  -d '{"email":"user2@test.com","password":"testpass123"}'

# Create tasks for both users
# Attempt cross-user access to verify isolation
```

**Rationale**:
- Constitution allows manual testing for Phase II
- Automated tests planned for Phase III
- Manual testing validates all success criteria
- Faster to implement than automated tests

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **API Design** | RESTful with explicit user_id in URL | Aligns with constitution, clear data ownership |
| **ORM** | SQLModel with Pydantic validation | Type safety, existing backend pattern |
| **User Isolation** | Multi-layer enforcement (middleware + query) | Defense in depth security |
| **Frontend Architecture** | Server Components + targeted Client Components | Minimal JS bundle, better performance |
| **State Management** | useState + router.refresh() | Simplest approach for single-page CRUD |
| **Validation** | Dual (HTML5 frontend + Pydantic backend) | UX + security |
| **Error Handling** | Structured responses + inline display | User-friendly, consistent |
| **Database** | Normalized schema with user_id index | Performance + data integrity |
| **Testing** | Manual testing with test plan | Sufficient for Phase II, automated later |

---

## Technologies Confirmed

**No new dependencies required!** All technologies already in use:

**Backend**:
- FastAPI (existing)
- SQLModel (existing)
- PyJWT (existing)
- Pydantic (built-in with FastAPI)
- Neon PostgreSQL (existing)

**Frontend**:
- Next.js 16 (existing)
- TypeScript (existing)
- Tailwind CSS (existing)
- Better Auth (existing)
- React 19 (existing)

**New Code Only**:
- Task model in backend
- Task CRUD routes in backend
- Task UI components in frontend
- API client methods in frontend

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Performance degradation with large task lists | Medium | Add pagination in future phase; index on user_id ensures fast queries |
| Concurrent updates causing data loss | Low | Last-write-wins acceptable for Phase II; optimistic locking in future |
| JWT token expiration during session | Low | Frontend handles 401 errors, redirects to login |
| Database connection pool exhaustion | Low | SQLModel session management + Neon auto-scaling |

---

**Research Completed**: 2026-01-30
**Ready for Phase 1**: Data model and API contracts
