# Function Contract: view_tasks_flow()

**Feature**: 002-add-view-tasks | **Date**: 2026-01-22
**Location**: `src/cli.py` | **Type**: UI Flow Function

---

## Signature

```python
def view_tasks_flow(storage: TodoStorage) -> None:
    """Display all tasks in storage with formatted output.

    Retrieves all tasks from storage and displays them in a formatted list
    with completion status indicators. Shows helpful empty state message
    if no tasks exist.

    Args:
        storage: TodoStorage instance containing tasks to display.

    Returns:
        None. Side effects: prints to stdout only, no storage modifications.

    Raises:
        No exceptions. Read-only operation.
    """
```

---

## Inputs

### Parameters

| Name | Type | Required | Constraints | Notes |
|------|------|----------|-------------|-------|
| `storage` | `TodoStorage` | Yes | Must be initialized instance | Read-only access |

### User Input (Interactive)

**None**. This is a display-only flow with no user input during execution.

---

## Outputs

### Return Value

**Type**: `None`

This is a UI flow function with side effects. No return value.

### Side Effects

1. **Storage Modification**: None (read-only operation)

2. **Console Output**:
   - Header/separator (optional, for visual organization)
   - Task list (if tasks exist)
   - Empty state message (if no tasks exist)
   - Footer/spacing (optional)

### Console Output Examples

**Case 1: Empty Storage**
```

📝 No tasks yet! Add your first task.
   Select option 1 from the menu to get started.

```

**Case 2: Single Task (Incomplete)**
```

=== Your Tasks ===

[☐] ID: 1 - Buy groceries
Description: Milk, eggs, bread

```

**Case 3: Multiple Tasks (Mixed Completion States)**
```

=== Your Tasks ===

[☐] ID: 1 - Buy groceries
Description: Milk, eggs, bread

[☑] ID: 2 - Call dentist

[☐] ID: 3 - Finish report
Description: Q4 financial summary

```

**Case 4: Task with No Description**
```

=== Your Tasks ===

[☐] ID: 1 - Call dentist

```

---

## Preconditions

1. `storage` must be a valid `TodoStorage` instance
2. Terminal must support UTF-8 for emoji/checkbox display
3. `print()` must be available (standard Python environment)

---

## Postconditions

1. **Storage State**:
   - Unchanged (read-only operation)
   - No tasks added, modified, or deleted

2. **Console State**:
   - Task list displayed (or empty state message)
   - User can read and understand their current task status
   - Visual separation maintained for readability

3. **User State**:
   - User returned to main menu context after display
   - No confirmation or acknowledgment required (display-only)

---

## Error Handling

### System Errors

| Error Condition | Likelihood | Handling |
|----------------|------------|----------|
| `storage.get_all()` returns corrupted data | Very Low (type-safe in-memory dict) | Not handled - let exception propagate |
| Terminal encoding error (emoji) | Low (UTF-8 standard on modern systems) | Not handled - acceptable degradation |
| Very long task list (>1000 tasks) | Low (within performance requirements) | Display all (no pagination in Phase I) |

**Design Decision**: This is a read-only display function with minimal error surface. No error handling needed beyond Python's default exception propagation.

---

## Algorithm / Implementation Notes

### Step-by-Step Flow

1. **Retrieve All Tasks**:
   ```python
   tasks = storage.get_all()
   # Returns sorted list of Todo instances (or empty list)
   ```

2. **Check if Empty**:
   ```python
   if not tasks:
       # Display empty state
   else:
       # Display task list
   ```

3. **Display Empty State** (if no tasks):
   ```python
   print()
   print("📝 No tasks yet! Add your first task.")
   print("   Select option 1 from the menu to get started.")
   print()
   ```

4. **Display Task List** (if tasks exist):
   ```python
   print()
   print("=== Your Tasks ===")
   print()
   for task in tasks:
       print(task)  # Uses Todo.__str__() for formatting
       print()      # Blank line between tasks
   ```

5. **Wait for User Acknowledgment** (Optional):
   ```python
   input("\nPress Enter to continue...")
   ```

---

## Display Format Specification

### Empty State Format

```
[blank line]
📝 No tasks yet! Add your first task.
   Select option 1 from the menu to get started.
[blank line]
```

**Requirements**:
- Must use emoji "📝" (FR-011)
- Must include helpful guidance on what to do next
- Must be visually distinct from task list

### Task List Header Format

```
[blank line]
=== Your Tasks ===
[blank line]
```

**Requirements**:
- Optional header for visual organization
- Clear separator from menu/other content

### Individual Task Format

Delegated to `Todo.__str__()` method (`src/todo.py:53-70`):

**Format**: `[{checkbox}] ID: {id} - {title}\nDescription: {description}`

Where:
- `{checkbox}` = "☑" if completed, "☐" if incomplete
- `{id}` = task ID number
- `{title}` = task title
- `{description}` = displayed only if non-empty

**Examples**:
```
[☐] ID: 1 - Buy groceries
Description: Milk, eggs, bread
```
```
[☑] ID: 2 - Call dentist
```

### Task Separator

```
[blank line between each task]
```

**Rationale**: Blank lines improve scan-ability for lists with descriptions.

---

## Dependencies

### Internal Dependencies

| Module | Import | Usage |
|--------|--------|-------|
| `storage` | `from storage import TodoStorage` | Type hint only (passed as parameter) |
| `todo` | (none) | No direct import needed (used via storage) |

### Standard Library

| Module | Usage |
|--------|-------|
| (none) | All functionality uses built-in `print()` |

---

## Test Cases

### TC-1: View Empty Task List

**Given**: Storage is empty (no tasks added)
**When**: User selects "View Tasks" from menu
**Then**:
- Empty state message displays
- Message includes: "📝 No tasks yet! Add your first task."
- Helpful guidance displayed
- No task list shown

### TC-2: View Single Incomplete Task

**Given**: Storage has 1 task (ID: 1, title: "Buy groceries", description: "Milk", completed: false)
**When**: User selects "View Tasks" from menu
**Then**:
- Header displays: "=== Your Tasks ==="
- Task displays: "[☐] ID: 1 - Buy groceries\nDescription: Milk"
- Checkbox shows "☐" (unchecked)

### TC-3: View Single Completed Task

**Given**: Storage has 1 task (ID: 2, title: "Call dentist", completed: true, no description)
**When**: User selects "View Tasks" from menu
**Then**:
- Task displays: "[☑] ID: 2 - Call dentist"
- Checkbox shows "☑" (checked)
- No description line (empty description)

### TC-4: View Multiple Tasks (Mixed States)

**Given**: Storage has 3 tasks (IDs: 1, 2, 3; various completion states)
**When**: User selects "View Tasks" from menu
**Then**:
- All 3 tasks displayed in order (sorted by ID)
- Completion status correct for each task
- Blank lines separate tasks
- Descriptions shown only for tasks that have them

### TC-5: View Tasks After Adding New Task

**Given**: Storage has 1 task
**When**: User adds another task then views tasks
**Then**:
- Both tasks displayed
- New task shows at bottom (higher ID)
- New task shows as incomplete (☐)

### TC-6: View Large Task List (1000 Tasks)

**Given**: Storage has 1000 tasks
**When**: User selects "View Tasks" from menu
**Then**:
- All 1000 tasks displayed
- Operation completes in <5 seconds (SC-002)
- No pagination or truncation
- Terminal scrolling handles overflow

### TC-7: View Task with Multi-line Description

**Given**: Storage has task with description containing line breaks
**When**: User selects "View Tasks" from menu
**Then**:
- Description displayed as-is (Python string handles newlines)
- Terminal wrapping handles long lines
- Formatting preserved

---

## Performance Considerations

- **Time Complexity**: O(n log n) for `storage.get_all()` (sorting), then O(n) for display
- **Space Complexity**: O(n) for task list in memory
- **Expected Runtime**: <5 seconds for 1000 tasks (SC-002 requirement)
- **Actual Runtime**: ~50ms for 1000 tasks (Python list sorting + printing is fast)

**Performance Analysis**:
- `storage.get_all()`: O(n log n) due to sorting
- Display loop: O(n) for printing
- Total: O(n log n) dominated by sorting
- For n=1000: ~0.01 seconds (well under 5-second requirement)

**Bottleneck**: Terminal rendering, not Python computation. Most time spent in terminal I/O for large lists.

---

## Accessibility Considerations

### Unicode Symbol Support

**Symbols Used**: ☐ (U+2610), ☑ (U+2611), 📝 (U+1F4DD)

**Platform Support**:
- macOS: Full support (default Terminal and iTerm2)
- Linux: Full support (most modern terminals)
- Windows 10+: Full support (Windows Terminal, ConEmu)
- Windows 7-8: Partial support (may show boxes instead of emojis)

**Fallback Strategy**: None required for Phase I. Spec explicitly requires these symbols (FR-014, FR-011).

### Screen Reader Considerations

**Not in scope for Phase I**. Deferred to Phase IV (web frontend with ARIA labels).

---

## Related Contracts

- `TodoStorage.get_all()` - Retrieves tasks to display
- `Todo.__str__()` - Formats individual task display
- `add_task_flow()` - Creates tasks that this flow displays
