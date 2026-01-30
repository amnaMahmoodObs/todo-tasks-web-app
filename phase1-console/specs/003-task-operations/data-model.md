# Data Model: Task Operations

**Feature**: Task Operations (Update, Delete, Toggle Complete)
**Date**: 2026-01-23
**Status**: No changes required

## Overview

This feature introduces no data model changes. It leverages the existing Todo entity and TodoStorage interface that were established in previous features. This document provides analysis for completeness and serves as reference for implementation.

## Existing Entities

### Entity: Todo

**Purpose**: Represents a single task with metadata for tracking and display.

**Location**: `src/todo.py`

**Attributes**:

| Attribute | Type | Required | Default | Validation | Notes |
|-----------|------|----------|---------|------------|-------|
| id | int | Yes | (assigned) | Positive integer | Auto-assigned by storage |
| title | str | Yes | N/A | Non-empty after strip, ≤100 chars | Primary task description |
| description | str | No | "" | None | Optional detailed information |
| completed | bool | Yes | False | Boolean only | Task completion status |
| created_at | datetime | Yes | now() | Valid datetime | Timestamp of creation |

**Validation Rules** (enforced in Todo.__init__ and TodoStorage.update):
- Title cannot be empty string or whitespace-only
- Title cannot exceed 100 characters
- Description has no length constraints
- created_at auto-set if not provided

**Display Format** (Todo.__str__):
```
[☐] ID: 1 - Task title
Description: Optional description text

[☑] ID: 2 - Completed task
```

### Entity: TodoStorage

**Purpose**: Repository interface for managing Todo collection in memory.

**Location**: `src/storage.py`

**Storage Mechanism**: Dictionary-based (`dict[int, Todo]`) with auto-incrementing ID counter.

**Methods Used by This Feature**:

#### get(id: int) -> Todo | None

**Purpose**: Retrieve task by ID for existence checking and display.

**Behavior**:
- Returns Todo instance if ID exists
- Returns None if ID not found (never raises KeyError)
- Used by all three flows for validation

**Usage Pattern**:
```python
task = storage.get(task_id)
if task is None:
    print(f"❌ Task #{task_id} not found")
    return
```

#### update(id: int, **fields) -> bool

**Purpose**: Selectively update task fields.

**Parameters**:
- `id`: Task ID to update
- `title`: Optional new title (validated)
- `description`: Optional new description (no validation)
- `completed`: Optional new completion status

**Behavior**:
- Returns True if task found and updated
- Returns False if task ID not found
- Raises ValueError if title is empty/whitespace
- Raises ValueError if title exceeds 100 characters
- Only updates provided fields (others unchanged)

**Usage Pattern**:
```python
# Update single field
storage.update(task_id, completed=True)

# Update multiple fields
storage.update(task_id, title="New Title", description="New Desc")

# Selective update (skip unchanged fields)
if new_title:
    storage.update(task_id, title=new_title)
```

#### delete(id: int) -> bool

**Purpose**: Permanently remove task from storage.

**Behavior**:
- Returns True if task found and deleted
- Returns False if task ID not found
- Deleted IDs are not reused (next_id counter continues)
- Hard delete (no soft delete or archiving)

**Usage Pattern**:
```python
if storage.delete(task_id):
    print("✓ Task deleted!")
else:
    print("❌ Task not found")
```

## State Transitions

### Completion Status Lifecycle

```
┌─────────────┐                    ┌─────────────┐
│  Incomplete │ ─── toggle ───────>│  Complete   │
│ completed=False                   │ completed=True
└─────────────┘ <─── toggle ────── └─────────────┘
```

**Trigger**: toggle_complete_flow
**Operation**: `storage.update(id, completed=not task.completed)`
**Reversible**: Yes (can toggle indefinitely)

### Task Existence Lifecycle

```
┌─────────────┐                    ┌─────────────┐
│   Exists    │ ─── delete ───────>│   Deleted   │
│ (in storage)│                     │ (removed)   │
└─────────────┘                     └─────────────┘
```

**Trigger**: delete_task_flow with 'y' confirmation
**Operation**: `storage.delete(id)`
**Reversible**: No (permanent deletion, ID not reused)

### Task Content Lifecycle

```
┌─────────────┐                    ┌─────────────┐
│  Original   │ ─── update ───────>│   Updated   │
│  Content    │                     │   Content   │
└─────────────┘                     └─────────────┘
        │                                  │
        └───────────── multiple ───────────┘
               updates possible
```

**Trigger**: update_task_flow
**Operation**: `storage.update(id, title=..., description=...)`
**Reversible**: No (previous content not stored, but can update again)
**Note**: Completion status preserved during content updates

## Data Integrity Rules

### Enforced by Storage Layer

1. **ID Uniqueness**: Storage auto-assigns unique sequential IDs starting at 1
2. **ID Immutability**: Task IDs never change after assignment
3. **Title Validation**: Non-empty, ≤100 characters (enforced in update())
4. **Atomic Operations**: Each storage operation (get/update/delete) is atomic

### Not Enforced (Acceptable for Phase I)

1. **Concurrency Control**: No locking (single-threaded CLI environment)
2. **Transaction Rollback**: No undo/redo (manual testing sufficient)
3. **Audit Trail**: No history of changes (out of scope per constitution)
4. **Referential Integrity**: No relationships to check (single entity)

## Storage Invariants

These invariants must hold after every operation:

1. **ID Sequencing**: `_next_id > max(all task IDs)` always true
2. **Dictionary Consistency**: Every key in `_todos` matches its task's `id` attribute
3. **Non-null Tasks**: No None values in `_todos` dictionary
4. **Title Validity**: Every task in storage has non-empty title ≤100 chars

## Feature Impact Summary

| Operation | Creates | Reads | Updates | Deletes | Changes Schema |
|-----------|---------|-------|---------|---------|----------------|
| toggle_complete_flow | No | Yes (get) | Yes (completed) | No | No |
| update_task_flow | No | Yes (get) | Yes (title/desc) | No | No |
| delete_task_flow | No | Yes (get) | No | Yes (remove) | No |

**Schema Changes**: None
**New Entities**: None
**Modified Entities**: None
**New Relationships**: None

## Phase II Considerations

When transitioning to file persistence (Phase II), these operations will need:

1. **File Locking**: Prevent concurrent writes
2. **Serialization**: JSON serialization of datetime for created_at
3. **Error Handling**: IO errors (disk full, permissions)
4. **Performance**: Consider indexing for large task lists

The current interface design (get/update/delete) will support Phase II persistence swap without changes to these flows.
