# Quick Start Guide: Add and View Tasks

**Feature**: 002-add-view-tasks | **Date**: 2026-01-22

This guide helps developers understand how to implement the Add Task and View Tasks features.

---

## Overview

This feature adds the first two CRUD operations to the Todo Console Application:
1. **Add Task**: Create new todos with title validation and optional descriptions
2. **View Tasks**: Display all todos in a formatted list with completion status

**Implementation Scope**:
- Add 2 new functions to `src/cli.py`
- Update menu wiring in `src/main.py` and `main.py`
- No changes to existing classes (`Todo`, `TodoStorage`)

---

## Prerequisites

### Existing Codebase Knowledge

Before implementing, familiarize yourself with:

1. **`Todo` class** (`src/todo.py:10-86`):
   - Constructor with title validation
   - `__str__()` method for display formatting
   - Attributes: `id`, `title`, `description`, `completed`, `created_at`

2. **`TodoStorage` class** (`src/storage.py:10-124`):
   - `add(todo)` - Assigns ID and stores task
   - `get_all()` - Returns sorted list of all tasks

3. **Existing CLI utilities** (`src/cli.py:12-68`):
   - `display_menu()` - Shows main menu
   - `get_user_choice()` - Gets validated menu input
   - `clear_screen()` - Clears terminal

### Read These Documents First

1. **Feature Specification**: `spec.md` - User stories and requirements
2. **Research Notes**: `research.md` - Design decisions and patterns
3. **Data Model**: `data-model.md` - Entity structure and validation rules
4. **Function Contracts**: `contracts/add_task_flow.md` and `contracts/view_tasks_flow.md`

---

## Implementation Checklist

### Step 1: Implement `add_task_flow()` in `src/cli.py`

**Location**: Add after existing functions in `src/cli.py` (around line 70)

**Requirements**:
- [ ] Import `Todo` class: `from todo import Todo`
- [ ] Function signature: `def add_task_flow(storage: TodoStorage) -> None:`
- [ ] Add docstring (Google style)
- [ ] Implement title validation loop:
  - Strip whitespace
  - Check non-empty (show "❌ Title cannot be empty")
  - Check ≤100 characters (show "❌ Title cannot exceed 100 characters")
  - Loop until valid
- [ ] Prompt for optional description (allow empty)
- [ ] Create `Todo` instance with validated inputs
- [ ] Call `storage.add(todo)` to persist
- [ ] Display success message: `"\n✓ Task #{id} added successfully!"`
- [ ] Print formatted task details via `Todo.__str__()`

**Reference**: See `contracts/add_task_flow.md` for detailed specification

---

### Step 2: Implement `view_tasks_flow()` in `src/cli.py`

**Location**: Add after `add_task_flow()` in `src/cli.py`

**Requirements**:
- [ ] Function signature: `def view_tasks_flow(storage: TodoStorage) -> None:`
- [ ] Add docstring (Google style)
- [ ] Call `storage.get_all()` to retrieve tasks
- [ ] Check if task list is empty:
  - If empty: Display "📝 No tasks yet! Add your first task." with helpful message
  - If not empty: Display header "=== Your Tasks ===" and iterate through tasks
- [ ] Print each task using `Todo.__str__()`
- [ ] Add blank lines between tasks for readability
- [ ] Optionally add `input("\nPress Enter to continue...")` for user pacing

**Reference**: See `contracts/view_tasks_flow.md` for detailed specification

---

### Step 3: Update Menu Wiring in `main.py`

**Location**: Update both `src/main.py` and root `main.py` (they should be identical or symlinked)

**Requirements**:
- [ ] Import new flow functions:
  ```python
  from cli import (
      display_menu,
      get_user_choice,
      clear_screen,
      add_task_flow,      # NEW
      view_tasks_flow     # NEW
  )
  ```
- [ ] Create `TodoStorage` instance before main loop:
  ```python
  from storage import TodoStorage
  storage = TodoStorage()
  ```
- [ ] Wire menu option 1 to `add_task_flow(storage)`
- [ ] Wire menu option 2 to `view_tasks_flow(storage)`
- [ ] Ensure main loop structure:
  ```python
  while True:
      clear_screen()
      display_menu()
      choice = get_user_choice()

      if choice == 1:
          add_task_flow(storage)
      elif choice == 2:
          view_tasks_flow(storage)
      elif choice == 6:
          print("\nGoodbye!")
          break
  ```

---

## Code Examples

### Example: `add_task_flow()` Implementation Outline

```python
def add_task_flow(storage: TodoStorage) -> None:
    """Interactive flow for adding a new task to storage.

    Prompts user for task title with validation (non-empty, ≤100 chars),
    prompts for optional description, creates Todo instance, persists to
    storage, and displays success confirmation.

    Args:
        storage: TodoStorage instance for persisting the new task.
    """
    # Step 1: Get validated title
    while True:
        title = input("Task title: ").strip()
        if not title:
            print("❌ Title cannot be empty")
            continue
        if len(title) > 100:
            print("❌ Title cannot exceed 100 characters")
            continue
        break  # Valid title

    # Step 2: Get optional description
    description = input("Description (optional, press Enter to skip): ").strip()

    # Step 3: Create Todo instance
    from todo import Todo
    new_todo = Todo(
        id=0,  # Will be reassigned by storage
        title=title,
        description=description
    )

    # Step 4: Persist to storage
    task_id = storage.add(new_todo)

    # Step 5: Display success message
    print(f"\n✓ Task #{task_id} added successfully!")
    print(new_todo)
    print()

    # Step 6: Wait for user acknowledgment
    input("\nPress Enter to continue...")
```

---

### Example: `view_tasks_flow()` Implementation Outline

```python
def view_tasks_flow(storage: TodoStorage) -> None:
    """Display all tasks in storage with formatted output.

    Retrieves all tasks from storage and displays them in a formatted list
    with completion status indicators. Shows helpful empty state message
    if no tasks exist.

    Args:
        storage: TodoStorage instance containing tasks to display.
    """
    # Step 1: Retrieve all tasks
    tasks = storage.get_all()

    # Step 2: Check if empty
    if not tasks:
        # Empty state
        print()
        print("📝 No tasks yet! Add your first task.")
        print("   Select option 1 from the menu to get started.")
        print()
    else:
        # Display task list
        print()
        print("=== Your Tasks ===")
        print()
        for task in tasks:
            print(task)  # Uses Todo.__str__()
            print()      # Blank line between tasks

    # Step 3: Wait for user acknowledgment
    input("\nPress Enter to continue...")
```

---

## Testing Guide

### Manual Test Scenarios

Run through these scenarios after implementation:

#### Test 1: Add First Task
1. Launch application
2. Select option 1 (Add Task)
3. Enter title: "Buy groceries"
4. Enter description: "Milk, eggs, bread"
5. **Verify**: Success message shows "✓ Task #1 added successfully!"
6. **Verify**: Task details display correctly

#### Test 2: Add Task Without Description
1. Select option 1 (Add Task)
2. Enter title: "Call dentist"
3. Press Enter (skip description)
4. **Verify**: Success message shows "✓ Task #2 added successfully!"
5. **Verify**: No description line in output

#### Test 3: Empty Title Validation
1. Select option 1 (Add Task)
2. Press Enter without typing (empty title)
3. **Verify**: Error message "❌ Title cannot be empty"
4. **Verify**: Re-prompted for title
5. Enter valid title
6. **Verify**: Task created successfully

#### Test 4: Title Length Validation
1. Select option 1 (Add Task)
2. Enter title with 101+ characters
3. **Verify**: Error message "❌ Title cannot exceed 100 characters"
4. **Verify**: Re-prompted for title
5. Enter valid title (≤100 chars)
6. **Verify**: Task created successfully

#### Test 5: Whitespace Handling
1. Select option 1 (Add Task)
2. Enter title: "  Clean room  " (with spaces)
3. **Verify**: Task created with trimmed title "Clean room"

#### Test 6: View Empty List
1. Launch fresh application (no tasks)
2. Select option 2 (View Tasks)
3. **Verify**: Empty state message displays
4. **Verify**: Message includes "📝 No tasks yet!"

#### Test 7: View Multiple Tasks
1. Add 3 tasks with various descriptions
2. Select option 2 (View Tasks)
3. **Verify**: All 3 tasks displayed
4. **Verify**: Tasks sorted by ID
5. **Verify**: Completion status shows "☐" (all incomplete)
6. **Verify**: Blank lines separate tasks

#### Test 8: Performance (1000 Tasks)
1. Add 1000 tasks (use script if manual is impractical)
2. Select option 2 (View Tasks)
3. **Verify**: All tasks displayed
4. **Verify**: Operation completes in <5 seconds

---

## Common Pitfalls

### Pitfall 1: Not Stripping Whitespace
**Problem**: User enters "  Task  " and validation passes, but title has spaces
**Solution**: Always `title.strip()` before validation

### Pitfall 2: Validating After Todo Constructor
**Problem**: `Todo.__init__()` raises exception instead of friendly error message
**Solution**: Validate in flow function BEFORE creating Todo instance

### Pitfall 3: Not Handling Empty Description
**Problem**: Empty description treated as error
**Solution**: Empty string is valid for description (no validation needed)

### Pitfall 4: Forgetting to Import Todo
**Problem**: `NameError: name 'Todo' is not defined`
**Solution**: Add `from todo import Todo` at top of `cli.py`

### Pitfall 5: Not Waiting for User Acknowledgment
**Problem**: Display flashes and immediately returns to menu
**Solution**: Add `input("\nPress Enter to continue...")` at end of flow functions

### Pitfall 6: Hardcoding Task ID
**Problem**: Manually setting `todo.id` instead of letting storage assign
**Solution**: Pass `id=0` to Todo constructor, let `storage.add()` reassign

---

## Debugging Tips

### Issue: Validation Error Messages Not Showing
**Check**:
1. Are you printing error messages inside the validation loop?
2. Is the loop condition correct (`while True`)?
3. Is `continue` being called after error message?

### Issue: Tasks Not Persisting
**Check**:
1. Are you calling `storage.add(todo)`?
2. Is the same `storage` instance being passed to both flows?
3. Is `storage` created before the main loop?

### Issue: Empty State Not Displaying
**Check**:
1. Is the condition `if not tasks:` correct?
2. Are you calling `storage.get_all()` before the check?
3. Is the empty state message printed inside the `if` block?

### Issue: Unicode Symbols Not Rendering
**Check**:
1. Is your terminal encoding set to UTF-8?
2. Are you using a modern terminal (macOS Terminal, iTerm2, Windows Terminal)?
3. Try running `locale` to verify UTF-8 support

---

## Next Steps After Implementation

1. **Run Manual Tests**: Complete all test scenarios above
2. **Code Review**: Self-review against function contracts
3. **Type Check**: Run `mypy src/` (if configured)
4. **Style Check**: Run `flake8 src/` to verify PEP 8 compliance
5. **Commit**: Create commit with message following conventional commits format
6. **Document**: Update `CHANGELOG.md` or `history/prompts/` as needed
7. **Move to Next Feature**: Ready for `/sp.tasks` to break down remaining CRUD operations

---

## Reference Links

- **Specification**: `spec.md`
- **Research**: `research.md`
- **Data Model**: `data-model.md`
- **Contracts**: `contracts/add_task_flow.md`, `contracts/view_tasks_flow.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Existing Code**:
  - `src/todo.py` - Todo class
  - `src/storage.py` - TodoStorage class
  - `src/cli.py` - CLI utilities

---

## Questions?

If you encounter issues or need clarification:
1. Re-read the function contracts in `contracts/`
2. Review research decisions in `research.md`
3. Check existing code patterns in `src/cli.py` (especially `get_user_choice()`)
4. Refer to constitution principles in `.specify/memory/constitution.md`
