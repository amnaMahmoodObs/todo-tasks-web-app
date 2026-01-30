# Implementation Quickstart: Task Operations

**Feature**: Task Operations (Update, Delete, Toggle Complete)
**For**: `/sp.tasks` command and implementation phase
**Date**: 2026-01-23

## Overview

This guide provides implementation-ready patterns, code snippets, and testing guidance for the three new CLI flows. All patterns follow existing codebase conventions from `src/cli.py`.

## Implementation Order

Follow spec priorities for incremental delivery:

1. ✅ **toggle_complete_flow** (P1) - Simplest, highest value
2. ✅ **update_task_flow** (P2) - Moderate complexity
3. ✅ **delete_task_flow** (P3) - Confirmation loop complexity
4. ✅ **main.py integration** - Wire all flows to menu

Each step is independently testable and deliverable.

## File Locations

**New Code**:
- `src/cli.py` - Add 3 new functions (~120 lines total)

**Modified Code**:
- `src/main.py` - Update imports and menu dispatch (~5 lines)

**No Changes**:
- `src/todo.py` - Existing Todo model
- `src/storage.py` - Existing storage interface

## Common Patterns

All three flows share these patterns from existing `add_task_flow` and `view_tasks_flow`:

### Pattern 1: Function Signature

```python
def function_name_flow(storage: TodoStorage) -> None:
    """One-line summary ending with period.

    Multi-line description explaining the flow behavior, inputs,
    and outputs. Include information about prompts and validations.

    Args:
        storage: TodoStorage instance for retrieving and modifying tasks.

    Returns:
        None. Side effects: [describe storage changes and output].

    Error Handling:
        - Error case 1: behavior
        - Error case 2: behavior
    """
```

**Location**: After `view_tasks_flow()` in `src/cli.py` (line 162+)

**Import Requirement**: TodoStorage type hint
```python
from storage import TodoStorage  # Already present in cli.py
```

### Pattern 2: ID Input with Validation

**Purpose**: Parse user input as integer, handle non-numeric gracefully.

**Code**:
```python
# Step 1: Get and validate task ID
try:
    task_id_str = input("Enter task ID: ").strip()
    task_id = int(task_id_str)
except ValueError:
    print("❌ Invalid ID format. Please enter a number.")
    input("\nPress Enter to continue...")
    return
```

**Used By**: All 3 flows (toggle, update, delete)

**Rationale**:
- `input().strip()` removes whitespace
- `int()` raises ValueError for non-numeric input
- Early return prevents further execution on error
- User-friendly error message with ❌ prefix
- Wait for Enter maintains flow consistency

### Pattern 3: Existence Check

**Purpose**: Verify task exists before operation.

**Code**:
```python
# Step 2: Retrieve task and check existence
task = storage.get(task_id)
if task is None:
    print(f"❌ Task #{task_id} not found")
    input("\nPress Enter to continue...")
    return
```

**Used By**: All 3 flows

**Rationale**:
- `storage.get()` returns None for missing IDs (never raises KeyError)
- f-string includes user's input ID for clarity
- Early return pattern consistent with validation errors
- Wait for Enter before returning to menu

### Pattern 4: Display Task Details

**Purpose**: Show current task state before operation.

**Code**:
```python
# Step 3: Display current task
print("\nCurrent task:")
print(task)  # Uses Todo.__str__() for formatting
print()      # Blank line for readability
```

**Used By**: update_task_flow, delete_task_flow

**Not Used By**: toggle_complete_flow (shows result instead)

**Rationale**:
- Leverages existing Todo.__str__() formatting (checkbox, ID, title, description)
- "Current task:" label provides context
- Blank line separation improves readability

### Pattern 5: Success Confirmation

**Purpose**: Confirm operation completed and show result.

**Code**:
```python
# Final step: Display success and updated task
print("\n✓ Task [operation]!")  # e.g., "updated!", "deleted!"
print(task)  # Show result (for update/toggle, not delete)
input("\nPress Enter to continue...")
```

**Used By**: All 3 flows (varies by operation)

**Rationale**:
- ✓ prefix indicates success (matches add_task_flow pattern)
- Showing updated task provides immediate feedback
- Wait for Enter allows user to read before menu refresh

## Flow-Specific Implementation

### Flow 1: toggle_complete_flow (P1)

**Purpose**: Toggle task completion status (True ↔ False).

**Estimated Lines**: ~35 including docstring

**Implementation Steps**:

1. Get and validate task ID (Pattern 2)
2. Check task exists (Pattern 3)
3. Calculate new status
4. Update storage
5. Display status-specific success message
6. Show updated task
7. Wait for Enter

**Complete Implementation**:

```python
def toggle_complete_flow(storage: TodoStorage) -> None:
    """Interactive flow for toggling a task's completion status.

    Prompts user for task ID, validates existence, toggles the completed
    boolean (True↔False), updates storage, and displays status-specific
    success message with status icon.

    Args:
        storage: TodoStorage instance for retrieving and updating tasks.

    Returns:
        None. Side effects: updates task completion status, prints to stdout.

    Error Handling:
        - Non-numeric ID: displays error, returns early
        - Non-existent ID: displays "Task #X not found", returns early
    """
    # Step 1: Get and validate task ID
    try:
        task_id_str = input("Enter task ID: ").strip()
        task_id = int(task_id_str)
    except ValueError:
        print("❌ Invalid ID format. Please enter a number.")
        input("\nPress Enter to continue...")
        return

    # Step 2: Retrieve task and check existence
    task = storage.get(task_id)
    if task is None:
        print(f"❌ Task #{task_id} not found")
        input("\nPress Enter to continue...")
        return

    # Step 3: Toggle completion status
    new_status = not task.completed
    storage.update(task_id, completed=new_status)

    # Step 4: Display status-specific success message
    if new_status:
        print("\n✓ Task marked as complete!")
    else:
        print("\n✓ Task marked as incomplete!")

    # Step 5: Show updated task
    print(task)  # Todo.__str__() includes checkbox icon

    # Step 6: Wait for user acknowledgment
    input("\nPress Enter to continue...")
```

**Testing Scenarios**:
- Incomplete task (completed=False) → should become complete (☑)
- Complete task (completed=True) → should become incomplete (☐)
- Toggle twice → should return to original state
- Invalid ID format → error message
- Non-existent ID → "not found" message

---

### Flow 2: update_task_flow (P2)

**Purpose**: Update task title and/or description with skip capability.

**Estimated Lines**: ~45 including docstring

**Implementation Steps**:

1. Get and validate task ID (Pattern 2)
2. Check task exists (Pattern 3)
3. Display current task (Pattern 4)
4. Prompt for new title (skippable)
5. Prompt for new description (skippable)
6. Update storage with provided fields only
7. Display success and updated task (Pattern 5)

**Complete Implementation**:

```python
def update_task_flow(storage: TodoStorage) -> None:
    """Interactive flow for updating an existing task's details.

    Prompts user for task ID, validates existence, displays current task,
    prompts for new title (skippable), prompts for new description (skippable),
    updates only provided fields, and displays confirmation with updated task.

    Args:
        storage: TodoStorage instance for retrieving and updating tasks.

    Returns:
        None. Side effects: updates task in storage, prints to stdout.

    Error Handling:
        - Non-numeric ID: displays error, returns early
        - Non-existent ID: displays "Task #X not found", returns early
        - Empty title (after providing input): re-prompts with error
        - Title >100 chars: re-prompts with error (caught from storage)
        - No fields updated: displays info message, returns
    """
    # Step 1: Get and validate task ID
    try:
        task_id_str = input("Enter task ID: ").strip()
        task_id = int(task_id_str)
    except ValueError:
        print("❌ Invalid ID format. Please enter a number.")
        input("\nPress Enter to continue...")
        return

    # Step 2: Retrieve task and check existence
    task = storage.get(task_id)
    if task is None:
        print(f"❌ Task #{task_id} not found")
        input("\nPress Enter to continue...")
        return

    # Step 3: Display current task
    print("\nCurrent task:")
    print(task)
    print()

    # Step 4: Get new title (skippable)
    new_title = input("New title (or press Enter to skip): ").strip()

    # Step 5: Get new description (skippable)
    new_description = input("New description (or press Enter to skip): ").strip()

    # Step 6: Check if any updates provided
    if not new_title and not new_description:
        print("\n❌ No changes provided")
        input("\nPress Enter to continue...")
        return

    # Step 7: Update storage (storage validates title if provided)
    try:
        if new_title and new_description:
            storage.update(task_id, title=new_title, description=new_description)
        elif new_title:
            storage.update(task_id, title=new_title)
        elif new_description:
            storage.update(task_id, description=new_description)
    except ValueError as e:
        print(f"\n❌ {str(e)}")
        input("\nPress Enter to continue...")
        return

    # Step 8: Display success and updated task
    print("\n✓ Task updated!")
    print(task)
    input("\nPress Enter to continue...")
```

**Testing Scenarios**:
- Update title only → description unchanged
- Update description only → title unchanged
- Update both → both changed
- Skip both → "no changes" message
- Empty title provided → storage raises ValueError (caught)
- Title >100 chars → storage raises ValueError (caught)
- Invalid ID → error handling
- Non-existent ID → "not found" message

---

### Flow 3: delete_task_flow (P3)

**Purpose**: Delete task with explicit y/n confirmation.

**Estimated Lines**: ~40 including docstring

**Implementation Steps**:

1. Get and validate task ID (Pattern 2)
2. Check task exists (Pattern 3)
3. Display task to be deleted (Pattern 4)
4. Loop for confirmation (y/n with validation)
5. If 'y': delete and show success
6. If 'n': show cancellation
7. Wait for Enter

**Complete Implementation**:

```python
def delete_task_flow(storage: TodoStorage) -> None:
    """Interactive flow for deleting a task with explicit confirmation.

    Prompts user for task ID, validates existence, displays task details,
    requests y/n confirmation, deletes task only on 'y' confirmation,
    and displays appropriate success or cancellation message.

    Args:
        storage: TodoStorage instance for retrieving and deleting tasks.

    Returns:
        None. Side effects: may delete task from storage, prints to stdout.

    Error Handling:
        - Non-numeric ID: displays error, returns early
        - Non-existent ID: displays "Task #X not found", returns early
        - Invalid confirmation (not y/n): re-prompts with error message
        - Confirmation 'n': displays cancellation message, no deletion
    """
    # Step 1: Get and validate task ID
    try:
        task_id_str = input("Enter task ID: ").strip()
        task_id = int(task_id_str)
    except ValueError:
        print("❌ Invalid ID format. Please enter a number.")
        input("\nPress Enter to continue...")
        return

    # Step 2: Retrieve task and check existence
    task = storage.get(task_id)
    if task is None:
        print(f"❌ Task #{task_id} not found")
        input("\nPress Enter to continue...")
        return

    # Step 3: Display task to be deleted
    print("\nTask to delete:")
    print(task)
    print()

    # Step 4: Get confirmation with validation loop
    while True:
        confirmation = input("Delete this task? (y/n): ").strip().lower()
        if confirmation == 'y':
            # Step 5: Delete task
            storage.delete(task_id)
            print("\n✓ Task deleted!")
            break
        elif confirmation == 'n':
            # Step 6: Cancel deletion
            print("\n❌ Deletion cancelled")
            break
        else:
            # Invalid input - re-prompt
            print("❌ Invalid input. Please enter 'y' or 'n'")

    # Step 7: Wait for user acknowledgment
    input("\nPress Enter to continue...")
```

**Testing Scenarios**:
- Valid ID + 'y' confirmation → task deleted
- Valid ID + 'n' confirmation → task preserved, cancellation message
- Valid ID + invalid confirmation → re-prompt
- Valid ID + 'Y' (uppercase) → accepted (case insensitive via .lower())
- Invalid ID format → error handling
- Non-existent ID → "not found" message

---

### Integration: main.py Changes

**Purpose**: Wire menu options 3, 4, 5 to new flows.

**File**: `src/main.py`

**Changes Required**:

**1. Update Imports** (line 8-14):

```python
from cli import (
    display_menu,
    get_user_choice,
    clear_screen,
    add_task_flow,
    view_tasks_flow,
    update_task_flow,      # ADD THIS
    delete_task_flow,      # ADD THIS
    toggle_complete_flow   # ADD THIS
)
```

**2. Update Menu Dispatch** (replace lines 37-39):

```python
# BEFORE (lines 37-39):
elif choice in [3, 4, 5]:
    print("\n⚠️  Feature not yet implemented")
    input("\nPress Enter to continue...")

# AFTER:
elif choice == 3:
    update_task_flow(storage)
elif choice == 4:
    delete_task_flow(storage)
elif choice == 5:
    toggle_complete_flow(storage)
```

**Testing Scenarios**:
- Menu option 3 → update flow launches
- Menu option 4 → delete flow launches
- Menu option 5 → toggle flow launches
- All flows return to menu after completion
- Multiple operations in single session work correctly

---

## Complete Testing Checklist

Use this checklist for comprehensive manual testing after implementation.

### toggle_complete_flow Tests

- [ ] Incomplete task → complete (verify ☑ icon in output)
- [ ] Complete task → incomplete (verify ☐ icon in output)
- [ ] Toggle same task twice (returns to original state)
- [ ] Invalid ID format (non-numeric input)
- [ ] Non-existent task ID
- [ ] Negative task ID (treated as non-existent)
- [ ] Toggle after add (integration test)
- [ ] Toggle after update (integration test)

### update_task_flow Tests

- [ ] Update title only (description unchanged)
- [ ] Update description only (title unchanged)
- [ ] Update both fields (both changed)
- [ ] Skip both fields (no changes message)
- [ ] Empty title provided (validation error from storage)
- [ ] Whitespace-only title (treated as empty, validation error)
- [ ] Title exactly 100 chars (accepted)
- [ ] Title 101 chars (validation error from storage)
- [ ] Very long description (10k chars - should work, no limit)
- [ ] Invalid ID format (non-numeric input)
- [ ] Non-existent task ID
- [ ] Update preserves completion status (verify unchanged)
- [ ] Update after toggle (integration test)

### delete_task_flow Tests

- [ ] Valid ID + 'y' confirmation (task deleted, verified by view)
- [ ] Valid ID + 'n' confirmation (task preserved)
- [ ] Valid ID + 'Y' uppercase (accepted, case insensitive)
- [ ] Valid ID + 'N' uppercase (accepted, case insensitive)
- [ ] Valid ID + invalid confirmation (e.g., 'yes') → re-prompt
- [ ] Valid ID + multiple invalid attempts → eventually 'y' (works)
- [ ] Valid ID + multiple invalid attempts → eventually 'n' (cancels)
- [ ] Invalid ID format (non-numeric input)
- [ ] Non-existent task ID
- [ ] Delete completed task (should work regardless of status)
- [ ] Attempt to toggle deleted task (should show not found)
- [ ] Attempt to update deleted task (should show not found)

### Integration Tests

- [ ] Add → Toggle → Update → Delete (full workflow)
- [ ] Menu option 3 launches update
- [ ] Menu option 4 launches delete
- [ ] Menu option 5 launches toggle
- [ ] All flows return to menu properly
- [ ] Screen clears between operations
- [ ] View tasks reflects all changes correctly
- [ ] Multiple operations in same session
- [ ] Exit (option 6) still works

### Error Handling Tests

- [ ] All error messages use ❌ prefix
- [ ] All success messages use ✓ prefix
- [ ] All flows wait for Enter before returning
- [ ] No stack traces shown to user
- [ ] Invalid inputs don't crash the application

---

## Code Quality Checklist

Before marking implementation complete, verify:

- [ ] All functions have Google-style docstrings
- [ ] All functions have type hints (parameters and return)
- [ ] All error paths have user-friendly messages
- [ ] No magic numbers (only literals: 'y', 'n', error messages)
- [ ] Function names are descriptive (no abbreviations)
- [ ] Variable names are descriptive (task_id not tid)
- [ ] Consistent indentation (4 spaces)
- [ ] No lines exceed 79 characters (PEP 8)
- [ ] Blank lines separate logical sections
- [ ] Comments explain "why" not "what"
- [ ] No external dependencies imported
- [ ] Type hints use Python 3.13+ syntax (e.g., `list[T]` not `List[T]`)

---

## Performance Considerations

For Phase I (in-memory storage):
- All operations are O(1) or O(log n) for dictionary access
- No performance concerns with <1000 tasks
- Input validation is negligible overhead

For Phase II (file persistence):
- Consider read-modify-write atomicity
- May need file locking for concurrent access
- Serialization overhead for large task lists

Current design supports Phase II evolution without changes to these flows.

---

## Next Steps After Implementation

1. **Run all manual tests** from checklist above
2. **Commit changes** with message: "feat: implement update/delete/toggle task operations"
3. **Update documentation** if any edge cases discovered
4. **Consider ADR** if architectural decisions were made during implementation (unlikely for this feature)

This quickstart provides everything needed for `/sp.tasks` to generate actionable implementation tasks!
