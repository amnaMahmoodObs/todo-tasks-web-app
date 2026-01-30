# Function Contract: add_task_flow()

**Feature**: 002-add-view-tasks | **Date**: 2026-01-22
**Location**: `src/cli.py` | **Type**: UI Flow Function

---

## Signature

```python
def add_task_flow(storage: TodoStorage) -> None:
    """Interactive flow for adding a new task to storage.

    Prompts user for task title with validation (non-empty, ≤100 chars),
    prompts for optional description, creates Todo instance, persists to
    storage, and displays success confirmation.

    Args:
        storage: TodoStorage instance for persisting the new task.

    Returns:
        None. Side effects: adds task to storage, prints to stdout.

    Raises:
        No exceptions. All errors handled internally with user-friendly
        messages and re-prompting.
    """
```

---

## Inputs

### Parameters

| Name | Type | Required | Constraints | Notes |
|------|------|----------|-------------|-------|
| `storage` | `TodoStorage` | Yes | Must be initialized instance | Used to persist new task |

### User Input (Interactive)

| Prompt | Type | Required | Validation | Error Message |
|--------|------|----------|------------|---------------|
| "Task title: " | `str` | Yes | Non-empty after strip, ≤100 chars | "❌ Title cannot be empty" or "❌ Title cannot exceed 100 characters" |
| "Description (optional, press Enter to skip): " | `str` | No | None | N/A - empty is valid |

---

## Outputs

### Return Value

**Type**: `None`

This is a UI flow function with side effects. No return value.

### Side Effects

1. **Storage Modification**:
   - Calls `storage.add(todo)` to persist new task
   - Assigns unique ID to task
   - Increments storage ID counter

2. **Console Output**:
   - Error messages during validation (if user input invalid)
   - Success message: `"\n✓ Task #{id} added successfully!"`
   - Formatted task details via `Todo.__str__()`

### Console Output Examples

**Success Case**:
```
✓ Task #1 added successfully!
[☐] ID: 1 - Buy groceries
Description: Milk, eggs, bread

```

**Validation Error (Empty Title)**:
```
Task title:
❌ Title cannot be empty
Task title:
```

**Validation Error (Title Too Long)**:
```
Task title: This is a very long title that exceeds the one hundred character limit and should trigger a validation error message
❌ Title cannot exceed 100 characters
Task title:
```

**Success with No Description**:
```
✓ Task #2 added successfully!
[☐] ID: 2 - Call dentist

```

---

## Preconditions

1. `storage` must be a valid `TodoStorage` instance
2. `storage._next_id` must be > 0 (i.e., storage must be initialized)
3. Terminal must support UTF-8 for emoji display
4. `input()` and `print()` must be available (standard Python environment)

---

## Postconditions

1. **If user completes flow**:
   - New `Todo` instance created with unique ID
   - Task persisted in `storage._todos` dictionary
   - `storage._next_id` incremented by 1
   - Success message displayed to console
   - User returned to main menu context

2. **If user enters invalid input**:
   - User re-prompted until valid input provided
   - No task created until all validations pass
   - No storage modification until all validations pass

---

## Error Handling

### Input Validation Errors

| Error Condition | Handling | User Experience |
|----------------|----------|-----------------|
| Empty title (after strip) | Print error, re-prompt | Loop until valid input |
| Title >100 characters | Print error, re-prompt | Loop until valid input |
| Whitespace-only title | Stripped to empty, treated as empty title | Loop until valid input |

### System Errors

| Error Condition | Likelihood | Handling |
|----------------|------------|----------|
| `storage.add()` fails | Very Low (in-memory dict, never fails) | Not handled - let exception propagate |
| `Todo.__init__()` raises `ValueError` | Very Low (pre-validated in flow) | Not handled - should never occur |
| Terminal encoding error (emoji) | Low (UTF-8 standard on modern systems) | Not handled - acceptable degradation |

**Design Decision**: Pre-validate all inputs in flow function to provide friendly error messages. Constructor validation acts as safety net but should never trigger in normal operation.

---

## Algorithm / Implementation Notes

### Step-by-Step Flow

1. **Prompt for Title with Validation Loop**:
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

2. **Prompt for Optional Description**:
   ```python
   description = input("Description (optional, press Enter to skip): ").strip()
   # No validation - empty is valid
   ```

3. **Create Todo Instance**:
   ```python
   from todo import Todo
   from datetime import datetime

   new_todo = Todo(
       id=0,  # Will be reassigned by storage
       title=title,
       description=description,
       completed=False,  # Default
       created_at=datetime.now()  # Default (could be omitted)
   )
   ```

4. **Persist to Storage**:
   ```python
   task_id = storage.add(new_todo)
   # new_todo.id is now set to task_id
   ```

5. **Display Success Message**:
   ```python
   print(f"\n✓ Task #{task_id} added successfully!")
   print(new_todo)  # Uses Todo.__str__() for formatted output
   print()  # Blank line for spacing
   ```

6. **Wait for User Acknowledgment** (Optional):
   ```python
   input("\nPress Enter to continue...")
   ```

---

## Dependencies

### Internal Dependencies

| Module | Import | Usage |
|--------|--------|-------|
| `todo` | `from todo import Todo` | Create Todo instances |
| `storage` | `from storage import TodoStorage` | Type hint only (passed as parameter) |

### Standard Library

| Module | Usage |
|--------|-------|
| (none) | All functionality uses built-in `input()` and `print()` |

---

## Test Cases

### TC-1: Add Task with Title and Description

**Given**: Storage is empty
**When**: User enters title "Buy groceries" and description "Milk, eggs, bread"
**Then**:
- Task created with ID 1
- Task stored in storage
- Success message displays: "✓ Task #1 added successfully!"
- Task details show: "[☐] ID: 1 - Buy groceries\nDescription: Milk, eggs, bread"

### TC-2: Add Task with Title Only (No Description)

**Given**: Storage has 1 task
**When**: User enters title "Call dentist" and presses Enter for description
**Then**:
- Task created with ID 2
- Task stored with empty description
- Success message displays: "✓ Task #2 added successfully!"
- Task details show: "[☐] ID: 2 - Call dentist" (no description line)

### TC-3: Empty Title Validation

**Given**: User starts add task flow
**When**: User enters empty string or whitespace-only title
**Then**:
- Error message displays: "❌ Title cannot be empty"
- User re-prompted for title
- No task created
- Storage unchanged

### TC-4: Title Length Validation

**Given**: User starts add task flow
**When**: User enters title with 101 characters
**Then**:
- Error message displays: "❌ Title cannot exceed 100 characters"
- User re-prompted for title
- No task created
- Storage unchanged

### TC-5: Title with Leading/Trailing Whitespace

**Given**: User starts add task flow
**When**: User enters "  Clean room  " (with spaces)
**Then**:
- Whitespace stripped automatically
- Task created with title "Clean room"
- Success message displays with trimmed title

### TC-6: Multiple Validation Failures

**Given**: User starts add task flow
**When**: User enters empty title 3 times, then valid title
**Then**:
- Error message displays 3 times
- On 4th attempt with valid title, task is created
- Success message displays

### TC-7: Exactly 100 Characters (Boundary)

**Given**: User starts add task flow
**When**: User enters title with exactly 100 characters
**Then**:
- Validation passes
- Task created successfully
- Success message displays

---

## Performance Considerations

- **Time Complexity**: O(1) for storage.add() operation
- **Space Complexity**: O(1) for single task creation
- **Expected Runtime**: <10ms for task creation and storage (user interaction time excluded)
- **Memory Impact**: ~200 bytes per task (Python object overhead + string data)

**Performance Goal**: Must complete task creation in <100ms (excluding user input time) per success criteria SC-001.

---

## Related Contracts

- `TodoStorage.add()` - Persists task to storage
- `Todo.__init__()` - Validates and creates Todo instance
- `Todo.__str__()` - Formats task for display
- `view_tasks_flow()` - Displays tasks created by this flow
