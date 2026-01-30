# Data Model: Project Setup - Core Architecture and Classes

**Feature**: 001-project-setup
**Created**: 2026-01-22
**Phase**: I (In-Memory CLI)

## Overview

This document defines the core data structures for the todo console application. Phase I uses an in-memory model with a single entity (Todo) and a repository-pattern storage layer (TodoStorage).

## Entities

### Todo

**Purpose**: Represents a single task with metadata for tracking and display.

**Attributes**:

| Attribute | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `id` | int | Yes | Assigned by storage | > 0, unique | Unique identifier for the todo |
| `title` | str | Yes | None | 1-100 characters, non-empty | Brief task description |
| `description` | str | No | "" (empty string) | No length limit | Detailed task information |
| `completed` | bool | Yes | False | True or False | Completion status flag |
| `created_at` | datetime | Yes | Auto-set to now() | Valid datetime | Timestamp of todo creation |

**Validation Rules**:
- `title` MUST NOT be empty string
- `title` MUST NOT exceed 100 characters (per constitution)
- `id` assigned by TodoStorage, not user-provided
- `created_at` auto-set if not provided in constructor
- All other attributes accept their type's valid values

**Display Formats**:

1. **String representation** (`__str__`):
   ```
   [☐] ID: 1 - Buy groceries
   Description: Milk, eggs, bread

   [☑] ID: 2 - Finish report
   Description: Q4 sales analysis
   ```

2. **Debug representation** (`__repr__`):
   ```
   Todo(id=1, title='Buy groceries', description='Milk, eggs, bread', completed=False, created_at=2026-01-22 14:30:00)
   ```

**State Transitions**:
- `completed`: False → True (mark complete)
- `completed`: True → False (mark incomplete) - supported but not exposed in Phase I UI
- `title`, `description`: Can be updated at any time
- `id`, `created_at`: Immutable after creation

**Relationships**:
- No relationships in Phase I (single entity model)
- Future: May relate to User, Category, Tag entities in later phases

---

### TodoStorage

**Purpose**: Repository interface for managing Todo collection in memory.

**Type**: Service/Repository (not an entity, but included for completeness)

**Internal State**:

| Attribute | Type | Visibility | Description |
|-----------|------|-----------|-------------|
| `_todos` | dict[int, Todo] | Private | Storage dictionary keyed by todo ID |
| `_next_id` | int | Private | Counter for assigning unique IDs |

**Operations**:

| Method | Input | Output | Side Effects | Description |
|--------|-------|--------|--------------|-------------|
| `__init__()` | None | None | Initializes empty `_todos`, sets `_next_id=1` | Constructor |
| `add(todo)` | Todo | int | Assigns ID to todo, stores in `_todos`, increments `_next_id` | Add new todo |
| `get(id)` | int | Todo \| None | None | Retrieve todo by ID |
| `get_all()` | None | list[Todo] | None | Retrieve all todos sorted by ID |
| `update(id, title?, desc?, completed?)` | int, optional fields | bool | Updates todo fields if ID exists | Partial update |
| `delete(id)` | int | bool | Removes todo from `_todos` if exists | Delete todo |

**Invariants**:
- IDs are sequential integers starting from 1
- IDs are never reused (even after deletion)
- IDs are unique across all todos
- `_todos` keys match the `id` attribute of stored Todo objects
- `get_all()` always returns todos in ID ascending order

**Concurrency**: Not applicable (single-user, single-threaded Phase I)

---

## Data Flow

### Todo Creation Flow
```
1. Create Todo instance (id=0, auto-set created_at)
2. Pass to TodoStorage.add()
3. Storage assigns unique ID (starting from 1)
4. Storage stores in _todos dict
5. Storage increments _next_id counter
6. Return assigned ID to caller
```

### Todo Retrieval Flow
```
1. Call TodoStorage.get(id) or get_all()
2. Storage looks up in _todos dict
3. Return Todo object(s) or None
4. Caller uses Todo for display/processing
```

### Todo Update Flow
```
1. Call TodoStorage.update(id, optional_fields)
2. Storage retrieves todo by ID
3. If found: update provided fields, return True
4. If not found: return False
5. Original Todo object is mutated in place
```

### Todo Deletion Flow
```
1. Call TodoStorage.delete(id)
2. Storage checks if ID exists in _todos
3. If exists: remove from dict, return True
4. If not exists: return False
5. ID is not reused (next_id keeps incrementing)
```

---

## Type System

**Python Type Annotations**:

```python
from datetime import datetime

class Todo:
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime

    def __init__(
        self,
        id: int,
        title: str,
        description: str = "",
        completed: bool = False,
        created_at: datetime | None = None
    ) -> None:
        ...

    def __str__(self) -> str:
        ...

    def __repr__(self) -> str:
        ...


class TodoStorage:
    _todos: dict[int, Todo]
    _next_id: int

    def __init__(self) -> None:
        ...

    def add(self, todo: Todo) -> int:
        ...

    def get(self, id: int) -> Todo | None:
        ...

    def get_all(self) -> list[Todo]:
        ...

    def update(
        self,
        id: int,
        title: str | None = None,
        description: str | None = None,
        completed: bool | None = None
    ) -> bool:
        ...

    def delete(self, id: int) -> bool:
        ...
```

---

## Evolution Strategy

### Phase II (File Persistence)
- **Change**: Swap TodoStorage implementation to FileStorage
- **Compatibility**: Todo class unchanged, same interface
- **Migration**: TodoStorage methods match file operations (read/write)

### Phase III (SQLite)
- **Change**: Swap to SQLiteStorage
- **Schema**:
  ```sql
  CREATE TABLE todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK(length(title) <= 100),
      description TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
  );
  ```
- **Mapping**: Python datetime ↔ SQLite TEXT (ISO 8601)

### Phase IV (REST API)
- **Change**: Add serialization methods to Todo
- **JSON Format**:
  ```json
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-22T14:30:00"
  }
  ```
- **API**: TodoStorage becomes backend service

### Phase V (Cloud/Kubernetes)
- **Change**: Distributed storage (Redis/DynamoDB)
- **Todo**: Unchanged (pure data class)
- **Storage**: Implement distributed locking, caching

---

## Validation Examples

**Valid Todo Creation**:
```python
# Auto-generated ID and timestamp
todo1 = Todo(id=0, title="Buy groceries", description="Milk, eggs, bread")

# Minimal (description optional)
todo2 = Todo(id=0, title="Call mom")

# Explicit completed status
todo3 = Todo(id=0, title="Finish report", completed=True)
```

**Invalid Todo Creation** (raises ValueError):
```python
# Empty title
todo_bad1 = Todo(id=0, title="")  # ValueError

# Title too long
todo_bad2 = Todo(id=0, title="A" * 101)  # ValueError (> 100 chars)
```

**TodoStorage Usage**:
```python
storage = TodoStorage()

# Add todos (IDs assigned automatically)
todo1 = Todo(id=0, title="Task 1")
id1 = storage.add(todo1)  # Returns 1
print(todo1.id)  # Now 1 (mutated by add())

todo2 = Todo(id=0, title="Task 2")
id2 = storage.add(todo2)  # Returns 2

# Retrieve
task = storage.get(1)  # Returns todo1
tasks = storage.get_all()  # Returns [todo1, todo2] sorted by ID

# Update (partial)
success = storage.update(1, title="Updated Task 1")  # True, only title changed
success = storage.update(1, completed=True)  # True, only completed changed
success = storage.update(99, title="Ghost")  # False (ID not found)

# Delete
success = storage.delete(1)  # True
success = storage.delete(1)  # False (already deleted)
todo3 = Todo(id=0, title="Task 3")
id3 = storage.add(todo3)  # Returns 3 (ID 1 not reused)
```

---

## Notes

- **Immutability**: Todo objects are mutable (required for in-place updates in storage)
- **Timezone**: Phase I uses timezone-naive datetime for simplicity
- **Unicode**: Full Unicode support in title/description (Python 3.13+ default)
- **Checkbox symbols**: ☐ (U+2610) unchecked, ☑ (U+2611) checked
- **No persistence**: All data lost on application exit in Phase I
- **Testing**: Manual testing via CLI in Phase I (no unit tests yet)
