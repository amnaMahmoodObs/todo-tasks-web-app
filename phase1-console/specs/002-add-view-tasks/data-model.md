# Data Model: Add and View Tasks

**Feature**: 002-add-view-tasks | **Date**: 2026-01-22

## Entities

### Todo (Existing - No Changes)

Represents a single task with metadata for tracking and display.

**Location**: `src/todo.py:10-86`

**Attributes**:

| Name | Type | Required | Default | Constraints | Notes |
|------|------|----------|---------|-------------|-------|
| `id` | `int` | Yes | Assigned by storage | Unique, auto-increment | Set by `TodoStorage.add()` |
| `title` | `str` | Yes | - | 1-100 characters, non-empty after strip | Validated in constructor |
| `description` | `str` | No | `""` | None | Empty string if not provided |
| `completed` | `bool` | No | `False` | - | Defaults to incomplete |
| `created_at` | `datetime` | No | `datetime.now()` | - | Auto-set on creation |

**Validation Rules**:
- Title must not be empty after stripping whitespace (`todo.py:41`)
- Title must not exceed 100 characters (`todo.py:43`)
- All other fields have no validation constraints

**State Transitions**:
- Created → Incomplete (default `completed=False`)
- Incomplete ↔ Complete (toggled via future `mark_complete_flow()`, not in this feature)

**Display Format** (via `__str__()`):
```
[☐] ID: 1 - Buy groceries
Description: Milk, eggs, bread
```

---

### TodoStorage (Existing - No Changes)

Repository interface for managing Todo collection in memory.

**Location**: `src/storage.py:10-124`

**Attributes**:

| Name | Type | Notes |
|------|------|-------|
| `_todos` | `dict[int, Todo]` | Internal dictionary keyed by ID |
| `_next_id` | `int` | Auto-increment counter, starts at 1 |

**Methods Used by This Feature**:

1. **`add(todo: Todo) -> int`** (`storage.py:26-41`)
   - Assigns unique ID to todo
   - Stores todo in internal dictionary
   - Increments ID counter
   - Returns assigned ID

2. **`get_all() -> list[Todo]`** (`storage.py:57-64`)
   - Returns all todos sorted by ID (ascending)
   - Returns empty list if no todos exist

---

## Data Flow

### Add Task Flow

```
User Input (title, description)
         ↓
   Validation Loop
   (strip, non-empty, ≤100 chars)
         ↓
   Create Todo Instance
   (id=0, title, description, completed=False, created_at=now)
         ↓
   storage.add(todo)
   (assigns ID, stores in dict)
         ↓
   Display Success Message
   (shows assigned ID + formatted task)
```

### View Tasks Flow

```
   User Selects "View Tasks"
         ↓
   storage.get_all()
   (returns sorted list of Todo instances)
         ↓
   Check if Empty
         ↓
   ├─ Yes → Display "📝 No tasks yet!" message
   │
   └─ No → For each todo:
           print(todo)  # Uses Todo.__str__()
```

---

## Relationships

**No relationships required for this feature.**

This is a single-entity CRUD system. Each `Todo` is independent. Relationships (e.g., task dependencies, categories, tags) are deferred to future phases.

---

## Invariants

1. **ID Uniqueness**: Every todo must have a unique ID within the storage
   - Enforced by: `TodoStorage._next_id` auto-increment
   - Violated if: Never (IDs are never reused even after deletion)

2. **Title Non-Empty**: Every todo must have a non-empty title after stripping
   - Enforced by: `Todo.__init__()` validation (`todo.py:41`)
   - Violated if: Validation is bypassed (won't happen with proper flow)

3. **Title Length**: Every todo title must be ≤100 characters
   - Enforced by: `Todo.__init__()` validation (`todo.py:43`)
   - Violated if: Validation is bypassed (won't happen with proper flow)

4. **Storage Consistency**: All todos in storage must be valid `Todo` instances
   - Enforced by: Type hints + `TodoStorage.add()` signature
   - Violated if: Never (Python type system + constructor validation)

---

## Data Validation Strategy

### Input Validation (in `add_task_flow()`)

**Title Validation**:
```python
while True:
    title = input("Task title: ").strip()
    if not title:
        print("❌ Title cannot be empty")
        continue
    if len(title) > 100:
        print("❌ Title cannot exceed 100 characters")
        continue
    break  # Valid title
```

**Description Validation**:
```python
description = input("Description (optional, press Enter to skip): ").strip()
# No validation - empty is valid
```

### Constructor Validation (in `Todo.__init__()`)

Already implemented in `src/todo.py:41-44`:
```python
if not title or len(title.strip()) == 0:
    raise ValueError("Title cannot be empty")
if len(title) > 100:
    raise ValueError("Title cannot exceed 100 characters")
```

**Strategy**: Validate in flow function BEFORE calling constructor to provide user-friendly error messages. Constructor validation acts as a safety net but should never be triggered in normal operation.

---

## Edge Cases

### Empty Storage
**Scenario**: User selects "View Tasks" with no todos in storage
**Handling**: Display friendly empty state message (see `view_tasks_flow()` specification)
**Data Impact**: None - empty list is a valid state

### Whitespace-Only Title
**Scenario**: User enters "   " (spaces only)
**Handling**: Stripped to empty string, validation fails with friendly error
**Data Impact**: None - todo is not created

### 100-Character Title Boundary
**Scenario**: User enters exactly 100 characters
**Handling**: Valid - passes both flow and constructor validation
**Data Impact**: Todo created successfully

### 101-Character Title
**Scenario**: User enters 101 characters
**Handling**: Validation fails with friendly error, user re-prompted
**Data Impact**: None - todo is not created

### Empty Description
**Scenario**: User presses Enter without typing description
**Handling**: Description set to empty string `""`
**Data Impact**: Todo created with `description=""` (valid state)

### Very Long Description
**Scenario**: User enters thousands of characters in description
**Handling**: Accepted (no length limit per spec)
**Data Impact**: Todo created, may cause terminal wrapping issues (deferred to later phases)

---

## Future Evolution Considerations

### Phase II (File Persistence)
- Data model stays the same
- Serialization format needed (JSON or pickle)
- `created_at` serialization (ISO 8601 string)

### Phase III (SQLite Database)
- `Todo` becomes an ORM model
- `id` becomes primary key
- `created_at` becomes timestamp column
- Validation moves to schema constraints

### Phase IV (REST API)
- `Todo` becomes a DTO (Data Transfer Object)
- JSON serialization/deserialization
- API contract validation (OpenAPI)

### Phase V (Cloud-Native)
- `Todo` becomes a distributed entity
- UUIDs instead of auto-increment IDs
- Timestamps in UTC
- Event sourcing for state transitions

**Design Decision for Phase I**: Keep data model simple and focused. Avoid premature abstraction. The current `Todo` class is designed to evolve cleanly through all phases with minimal changes.
