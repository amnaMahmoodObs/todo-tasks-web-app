# Data Model: Task Management

**Feature Branch**: `002-task-management`
**Date**: 2026-01-30
**Source**: Derived from spec.md (Key Entities section) and research.md

## Overview

This document defines the data model for task management, including database schema, entity relationships, and validation rules. The model supports multi-user task isolation with full CRUD operations.

---

## Entity: Task

### Description

Represents a single todo item owned by a user. Each task has a title, optional description, completion status, and timestamps tracking creation and modification.

### Database Schema (PostgreSQL)

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

### SQLModel Definition (Backend)

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """
    Task model representing a user's todo item.

    Attributes:
        id: Auto-incrementing primary key
        user_id: Foreign key to users table (UUID string)
        title: Task title (required, max 200 characters)
        description: Optional task description (max 1000 characters)
        completed: Completion status (default: False)
        created_at: Creation timestamp (auto-set)
        updated_at: Last modification timestamp (auto-updated)
    """
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        description="Owner of this task (UUID)"
    )
    title: str = Field(
        max_length=200,
        description="Task title (required)"
    )
    description: str | None = Field(
        default=None,
        description="Optional task description"
    )
    completed: bool = Field(
        default=False,
        index=True,
        description="Whether task is completed"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Last update timestamp"
    )
```

### TypeScript Interface (Frontend)

```typescript
/**
 * Task entity representing a user's todo item.
 */
export interface Task {
  /** Unique task identifier (auto-generated) */
  id: number;

  /** Owner user ID (UUID) */
  user_id: string;

  /** Task title (required, max 200 characters) */
  title: string;

  /** Optional description (max 1000 characters) */
  description: string | null;

  /** Completion status */
  completed: boolean;

  /** Creation timestamp (ISO 8601 format) */
  created_at: string;

  /** Last modification timestamp (ISO 8601 format) */
  updated_at: string;
}
```

---

## Field Specifications

### id (Primary Key)

- **Type**: Integer (auto-increment)
- **Constraints**: Primary key, NOT NULL, auto-generated
- **Purpose**: Unique identifier for each task
- **Generation**: Database sequence (SERIAL)

### user_id (Foreign Key)

- **Type**: String (VARCHAR 255)
- **Constraints**:
  - NOT NULL
  - Foreign key to `users.id`
  - ON DELETE CASCADE (orphaned tasks deleted when user deleted)
  - Indexed for query performance
- **Purpose**: Associates task with owning user
- **Validation**: Must reference existing user ID (UUID format)
- **Security**: All queries MUST filter by authenticated user's ID

### title

- **Type**: String
- **Constraints**:
  - NOT NULL
  - Max length: 200 characters
  - Cannot be empty or whitespace-only
- **Purpose**: Brief description of the task
- **Validation Rules**:
  - Frontend: `required`, `minLength={1}`, `maxLength={200}`
  - Backend: Pydantic `Field(..., min_length=1, max_length=200)` with custom validator to strip whitespace
- **Error Messages**:
  - Empty: "Title is required"
  - Too long: "Title must be 200 characters or less"

### description

- **Type**: String (TEXT)
- **Constraints**:
  - Nullable (optional field)
  - Max length: 1000 characters
- **Purpose**: Detailed information about the task
- **Validation Rules**:
  - Frontend: `maxLength={1000}` (optional)
  - Backend: Pydantic `Field(None, max_length=1000)`
- **Error Messages**:
  - Too long: "Description must be 1000 characters or less"
- **Default**: NULL

### completed

- **Type**: Boolean
- **Constraints**: NOT NULL
- **Purpose**: Tracks whether task is complete
- **Validation**: Must be boolean (true/false)
- **Default**: FALSE
- **Index**: Included in composite index `(user_id, completed)` for filtered queries
- **Behavior**: Can be toggled between true/false via PATCH endpoint

### created_at

- **Type**: Timestamp
- **Constraints**: NOT NULL
- **Purpose**: Records when task was created
- **Generation**: Auto-set to current UTC time on insert
- **Immutability**: Never updated after creation
- **Format**:
  - Database: TIMESTAMP (UTC)
  - API: ISO 8601 string (e.g., "2026-01-30T12:34:56.789Z")

### updated_at

- **Type**: Timestamp
- **Constraints**: NOT NULL
- **Purpose**: Records last modification time
- **Generation**:
  - Auto-set to current UTC time on insert
  - Auto-updated to current UTC time on every UPDATE
- **Triggers**: SQLModel `onupdate` callback
- **Format**:
  - Database: TIMESTAMP (UTC)
  - API: ISO 8601 string (e.g., "2026-01-30T12:34:56.789Z")

---

## Relationships

### Task → User (Many-to-One)

- **Type**: Many tasks belong to one user
- **Foreign Key**: `tasks.user_id` → `users.id`
- **Cardinality**:
  - One user can have zero or many tasks (1:N)
  - Each task belongs to exactly one user (N:1)
- **Cascade Behavior**:
  - ON DELETE CASCADE: When user deleted, all their tasks are deleted
  - No soft delete in Phase II
- **Query Pattern**:
  ```python
  # Get all tasks for a user
  tasks = session.exec(
      select(Task).where(Task.user_id == user_id)
  ).all()
  ```

### No Task → Task Relationships

- Tasks do not reference other tasks (no parent/child, no dependencies)
- Subtasks are out of scope for Phase II
- Task ordering is by `created_at` (newest first)

---

## Validation Rules

### Backend Validation (Authoritative)

**Pydantic Models**:

```python
from pydantic import BaseModel, Field, validator

class TaskCreate(BaseModel):
    """Request body for creating a new task."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

    @validator('title')
    def title_not_empty(cls, v):
        """Ensure title is not whitespace-only."""
        if not v or not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

    @validator('description')
    def description_clean(cls, v):
        """Strip whitespace from description if present."""
        return v.strip() if v else None


class TaskUpdate(BaseModel):
    """Request body for updating a task."""
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

    @validator('title')
    def title_valid_if_present(cls, v):
        """If title provided, ensure it's valid."""
        if v is not None and (not v or not v.strip()):
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip() if v else v

    @validator('description')
    def description_clean(cls, v):
        """Strip whitespace from description."""
        return v.strip() if v else None


class TaskResponse(BaseModel):
    """Response body for task endpoints."""
    id: int
    user_id: str
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allow SQLModel to dict conversion
```

### Frontend Validation (User Experience)

**HTML5 + JavaScript**:

```typescript
// Form validation
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [error, setError] = useState('');

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // Client-side validation
  if (!title || title.trim().length === 0) {
    setError('Title is required');
    return;
  }

  if (title.length > 200) {
    setError('Title must be 200 characters or less');
    return;
  }

  if (description && description.length > 1000) {
    setError('Description must be 1000 characters or less');
    return;
  }

  // Submit to API
  createTask({ title: title.trim(), description: description?.trim() || null });
};
```

---

## State Transitions

### Task Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                      TASK LIFECYCLE                     │
└─────────────────────────────────────────────────────────┘

[CREATE]
   │
   ├──> New Task (completed = false)
   │         │
   │         ├──> [UPDATE] → Modified Task (completed = false)
   │         │                     │
   │         │                     └──> [UPDATE] → ...
   │         │
   │         ├──> [PATCH /complete] → Completed Task (completed = true)
   │         │                              │
   │         │                              ├──> [PATCH /complete] → Incomplete (completed = false)
   │         │                              │
   │         │                              └──> [UPDATE] → Modified Completed Task
   │         │
   │         └──> [DELETE] → Task Removed (hard delete)
   │
   └──> [END]
```

### Valid State Transitions

| Current State | Action | New State | Notes |
|--------------|--------|-----------|-------|
| Not exists | CREATE | `completed = false` | Default status |
| `completed = false` | PATCH /complete | `completed = true` | Mark done |
| `completed = true` | PATCH /complete | `completed = false` | Mark incomplete |
| Any | UPDATE | Same completed status | Update title/description |
| Any | DELETE | Deleted (removed from DB) | Hard delete, no recovery |

### Immutable After Creation

- `id`: Auto-generated, never changes
- `user_id`: Set on creation, never changes (tasks cannot be transferred)
- `created_at`: Set on creation, never changes

### Mutable Fields

- `title`: Can be updated via PUT
- `description`: Can be updated via PUT
- `completed`: Can be toggled via PATCH
- `updated_at`: Auto-updated on every modification

---

## Data Constraints & Invariants

### Invariants (MUST always be true)

1. **User Ownership**: Every task MUST have a valid `user_id` that references an existing user
2. **Title Presence**: Every task MUST have a non-empty, non-whitespace title
3. **Length Limits**: Title ≤ 200 chars, Description ≤ 1000 chars (if present)
4. **Timestamp Ordering**: `created_at` ≤ `updated_at` (created before or at same time as last update)
5. **Boolean Completion**: `completed` MUST be exactly `true` or `false` (no NULL)

### Database-Level Constraints

- **Primary Key**: `id` is unique and NOT NULL
- **Foreign Key**: `user_id` references valid user, CASCADE delete
- **NOT NULL**: `user_id`, `title`, `completed`, `created_at`, `updated_at`
- **Check Constraints** (optional, enforced by application):
  - `LENGTH(title) > 0 AND LENGTH(title) <= 200`
  - `description IS NULL OR LENGTH(description) <= 1000`

### Application-Level Constraints

- **User Isolation**: Tasks MUST only be visible to their owner
- **Authorization**: User can only CREATE/READ/UPDATE/DELETE their own tasks
- **Validation**: All inputs validated before database insertion

---

## Indexing Strategy

### Indexes

```sql
-- Primary key index (automatic)
PRIMARY KEY (id)

-- Foreign key index for user lookups
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Composite index for filtered queries (e.g., "show incomplete tasks")
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
```

### Query Optimization

**Index Usage**:

| Query | Index Used | Performance |
|-------|-----------|-------------|
| `WHERE user_id = ?` | `idx_tasks_user_id` | O(log n) |
| `WHERE user_id = ? AND completed = ?` | `idx_tasks_user_completed` | O(log n) |
| `WHERE user_id = ? ORDER BY created_at DESC` | `idx_tasks_user_id` + sort | O(log n + k) |
| `WHERE id = ? AND user_id = ?` | `idx_tasks_user_id` + filter | O(log n) |

**Future Optimization** (Phase III+):
- Add index on `created_at` if sorting becomes a bottleneck
- Consider partial index on `(user_id) WHERE completed = false` for active tasks
- Evaluate query patterns and add covering indexes as needed

---

## Migration Strategy

### Initial Migration (CREATE TABLE)

```sql
-- Run this migration to create tasks table
BEGIN;

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

COMMIT;
```

### SQLModel Table Creation

```python
# In src/db.py or migration script
from sqlmodel import SQLModel, create_engine
from src.models import Task  # Import Task model

def create_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)
```

**Note**: SQLModel will auto-create tables on first run if they don't exist. For production, use Alembic migrations.

---

## Data Model Validation Checklist

✅ **Entities Defined**: Task entity with all fields specified
✅ **Relationships Mapped**: Task → User (many-to-one) with CASCADE delete
✅ **Constraints Documented**: NOT NULL, foreign keys, length limits
✅ **Validation Rules**: Frontend (HTML5) + Backend (Pydantic)
✅ **Indexes Planned**: Primary key, user_id, composite (user_id, completed)
✅ **State Transitions**: Lifecycle and valid transitions documented
✅ **Invariants Specified**: 5 critical invariants defined
✅ **Migration Path**: SQL script and SQLModel creation method provided
✅ **Type Safety**: SQLModel (Python) and TypeScript interfaces defined

---

**Data Model Approved**: Ready for API contract design (Phase 1 continued)
