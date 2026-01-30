# Implementation Plan: Task Operations (Update, Delete, Toggle Complete)

**Branch**: `003-task-operations` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-task-operations/spec.md`

## Summary

Implement three CRUD operations for the todo console application: update task details (title/description), delete tasks with confirmation, and toggle task completion status. All operations follow consistent patterns: ID validation with ValueError handling, existence checking via storage.get(), user-friendly error messages, and success confirmations. These operations complete the CRUD interface specified in the constitution's Phase I requirements.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Python standard library only (os, platform, datetime)
**Storage**: In-memory TodoStorage with dictionary-based persistence
**Testing**: Manual testing (automated tests deferred to Phase II per constitution)
**Target Platform**: Cross-platform console (macOS, Linux, Windows)
**Project Type**: Single project (console application)
**Performance Goals**: Interactive CLI response times (<1 second per operation)
**Constraints**: Standard library only, single-user environment, no external dependencies
**Scale/Scope**: 5 CRUD operations total (2 already implemented: Add, View; 3 to implement: Update, Delete, Toggle)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- ✅ **Principle I: Spec-Driven Development** - All code generated from spec.md by Claude Code
- ✅ **Principle II: Claude Code as Primary Tool** - Exclusive code generation via Claude Code
- ✅ **Principle III: Clean Architecture** - New flows in cli.py, integrates with existing storage.py and todo.py
- ✅ **Principle IV: Type Safety and Documentation** - Type hints and Google-style docstrings required for all functions
- ✅ **Principle V: Robust Error Handling** - ValueError catching, existence checks, user-friendly error messages
- ✅ **Principle VI: Standard Library Only** - No external dependencies introduced
- ✅ **Principle VII: Evolution Readiness** - Flows use existing storage interface (ready for Phase II persistence swap)

### Code Quality Standards

- ✅ **Python Standards** - PEP 8 compliance, Python 3.13+ features
- ✅ **Clean Code** - Functions <25 lines, descriptive naming, no magic numbers
- ✅ **Data Model** - Uses existing Todo entity (no schema changes)

### Development Workflow

- ✅ **CRUD Operations** - Implements 3 of 5 required operations (Update #3, Delete #4, Toggle #5)
- ✅ **Testing** - Manual testing required for all operations and error paths
- ✅ **Version Control** - Commit after each flow implementation

**GATE STATUS: ✅ PASSED** - All constitutional requirements satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-task-operations/
├── plan.md              # This file (/sp.plan output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (entity analysis)
├── quickstart.md        # Phase 1 output (implementation guide)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── main.py              # Update: wire options 3, 4, 5 to new flows
├── cli.py               # NEW: add update_task_flow, delete_task_flow, toggle_complete_flow
├── todo.py              # NO CHANGES (existing Todo model)
└── storage.py           # NO CHANGES (update/delete/get methods already exist)

tests/
└── (manual testing only in Phase I per constitution)
```

**Structure Decision**: Single project structure maintained. All new functionality added to existing cli.py module following the established pattern from add_task_flow and view_tasks_flow. No architectural changes needed - leverages existing TodoStorage interface that already implements required get(), update(), and delete() methods.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected. All constitutional requirements are satisfied without exceptions.*

---

## Phase 0: Research & Technical Decisions

### Research Questions

Based on Technical Context and spec requirements, the following technical decisions need documentation:

1. **Input Validation Pattern**: How should we distinguish between "skip update" (press Enter) vs "empty input" (provide empty string)?
2. **Error Display Pattern**: Should errors be displayed inline or with special formatting to match existing flows?
3. **Confirmation Loop Pattern**: How should we handle invalid confirmation responses (retry loop vs single warning)?
4. **ID Parsing Pattern**: Should ID validation be centralized or duplicated per flow?
5. **Success Message Format**: Should we display full task details after update or just confirmation?

### Existing Code Patterns (from codebase analysis)

From `src/cli.py` analysis:

**add_task_flow** demonstrates:
- Input validation with retry loops
- Error messages with ❌ prefix
- Success messages with ✓ prefix
- Detailed output showing created task
- `input("\nPress Enter to continue...")` for flow exit

**view_tasks_flow** demonstrates:
- Empty state handling with helpful messages
- Clear section headers with `===`
- Task display via Todo.__str__()
- Blank lines between tasks for readability

From `src/storage.py` analysis:

**TodoStorage.get()** returns:
- `Todo | None` (not raising KeyError)
- This means existence checking is simple: `if todo is None`

**TodoStorage.update()** behavior:
- Returns `bool` (True if updated, False if not found)
- Accepts keyword arguments for selective field updates
- Raises `ValueError` for empty/whitespace titles
- Raises `ValueError` for titles >100 characters

**TodoStorage.delete()** behavior:
- Returns `bool` (True if deleted, False if not found)
- Simple removal, no soft delete or archiving

### Research Findings

#### Decision 1: Input Validation - "Skip" vs "Empty"

**Decision**: Use `.strip()` on input, then check for empty string. Empty after strip = skip update.

**Rationale**:
- Matches existing pattern in add_task_flow (line 92: `title = input("Task title: ").strip()`)
- Users press Enter → empty string after strip → interpreted as "skip"
- Users type spaces → empty string after strip → interpreted as "skip" (same as Enter)
- Provides clear, predictable behavior

**Alternatives Considered**:
- Separate "skip" keyword: Rejected due to complexity and user confusion
- Check for empty before strip: Rejected because "   " would be invalid (not skipped)

**Implementation**:
```python
new_title = input("New title (or press Enter to skip): ").strip()
if not new_title:
    # Skip - don't update title
    pass
```

#### Decision 2: Error Display Pattern

**Decision**: Use existing pattern from add_task_flow: `print("❌ Error message")`

**Rationale**:
- Consistent with established codebase conventions (src/cli.py:94, 97)
- Visual ❌ icon makes errors immediately recognizable
- Users already familiar with this pattern from Add Task flow

**Alternatives Considered**:
- Plain text errors: Rejected due to lower visibility
- Banner/box formatting: Rejected as over-engineering for console app

**Implementation**:
```python
print("❌ Task #5 not found")
print("❌ Title cannot be empty")
```

#### Decision 3: Confirmation Loop Pattern

**Decision**: Use retry loop for invalid confirmation, similar to get_user_choice() pattern

**Rationale**:
- Matches existing pattern in get_user_choice (src/cli.py:42-54)
- User-friendly: allows correction without restarting flow
- Handles typos gracefully (user might press 'Y' instead of 'y')

**Alternatives Considered**:
- Single attempt then cancel: Rejected as unfriendly for typos
- Case-insensitive accept (Y/y/yes): Better UX, will implement `.lower()`

**Implementation**:
```python
while True:
    confirmation = input("Delete this task? (y/n): ").strip().lower()
    if confirmation == 'y':
        # proceed with delete
        break
    elif confirmation == 'n':
        # cancel
        break
    else:
        print("❌ Invalid input. Please enter 'y' or 'n'")
```

#### Decision 4: ID Parsing Pattern

**Decision**: Duplicate ID validation in each flow (no centralization in Phase I)

**Rationale**:
- Constitution Principle: Simplest viable change (avoid premature abstraction)
- Only 3 functions need validation (small duplication acceptable)
- Phase II refactoring can extract shared helper if needed
- Keeps each flow independently testable and understandable

**Alternatives Considered**:
- Shared get_validated_id() function: Rejected as premature optimization for 3 uses
- Decorator pattern: Rejected as over-engineering for Phase I scope

**Implementation** (duplicated in each flow):
```python
try:
    task_id = int(input("Enter task ID: ").strip())
except ValueError:
    print("❌ Invalid ID format. Please enter a number.")
    input("\nPress Enter to continue...")
    return
```

#### Decision 5: Success Message Format

**Decision**: Display full task details after update using Todo.__str__()

**Rationale**:
- Provides immediate feedback on what changed
- Matches pattern from add_task_flow (line 117-118)
- Helps users verify update was correct
- Leverages existing Todo.__str__() formatting

**Alternatives Considered**:
- Minimal confirmation only: Rejected due to lack of verification
- Before/after comparison: Rejected as excessive for Phase I MVP

**Implementation**:
```python
print(f"\n✓ Task updated!")
print(task)  # Uses Todo.__str__() for formatted display
```

---

## Phase 1: Data Model & Contracts

### Data Model Analysis

No changes required to existing data model. Analysis provided for completeness.

**Existing Entity: Todo** (from src/todo.py)

```
Todo
├── id: int (unique identifier, assigned by storage)
├── title: str (1-100 chars, required, validated)
├── description: str (optional, no max length)
├── completed: bool (default False)
└── created_at: datetime (auto-set on creation)
```

**Validation Rules** (already implemented):
- Title: Non-empty after strip, ≤100 characters
- Description: No validation (optional, any length)
- ID: Positive integer (enforced by storage auto-increment)
- Completed: Boolean only

**State Transitions**:
```
[Incomplete] ←→ [Complete]  (via toggle_complete_flow)
[Exists] → [Deleted]         (via delete_task_flow, irreversible)
[Any State] → [Updated]      (via update_task_flow, preserves completion status)
```

**Existing Entity: TodoStorage** (from src/storage.py)

Interface already provides all required methods:
- `get(id: int) -> Todo | None` ✅ Used for existence checking
- `update(id, **fields) -> bool` ✅ Used for selective field updates
- `delete(id: int) -> bool` ✅ Used for task removal

**No data model changes required for this feature.**

### API Contracts

This is a console application with no external API. "Contracts" refer to function signatures for the three new CLI flows.

#### Contract 1: update_task_flow

**Purpose**: Interactive flow for updating task title and/or description

**Signature**:
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
```

**Behavior**:
1. Prompt for task ID with validation (try-except ValueError)
2. Retrieve task via storage.get()
3. If not found: display "❌ Task #[ID] not found", return
4. Display current task details
5. Prompt for new title (Enter to skip)
6. If title provided: validate non-empty after strip
7. Prompt for new description (Enter to skip)
8. Call storage.update() with only provided fields
9. Display "✓ Task updated!" with updated task details
10. Wait for Enter before returning

**Acceptance Tests**:
- FR-001, FR-002: ID validation with ValueError handling
- FR-003, FR-004: Existence checking with error message
- FR-005, FR-006: Skip functionality for title and description
- FR-007, FR-008: Non-empty title validation
- FR-009: Selective field updates
- FR-010: Display current task before prompting
- FR-011: Success message with new details
- FR-021, FR-022: Type hints and docstring

#### Contract 2: delete_task_flow

**Purpose**: Interactive flow for deleting a task with confirmation

**Signature**:
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
```

**Behavior**:
1. Prompt for task ID with validation (try-except ValueError)
2. Retrieve task via storage.get()
3. If not found: display "❌ Task #[ID] not found", return
4. Display task details to be deleted
5. Loop: prompt for confirmation "Delete this task? (y/n): "
6. Validate confirmation (y/n only, case-insensitive)
7. If invalid: display error, re-prompt
8. If 'y': call storage.delete(), display "✓ Task deleted!"
9. If 'n': display "❌ Deletion cancelled"
10. Wait for Enter before returning

**Acceptance Tests**:
- FR-001, FR-002: ID validation with ValueError handling
- FR-003, FR-004: Existence checking with error message
- FR-012: Explicit y/n confirmation required
- FR-013: Validation and re-prompt for invalid confirmation
- FR-014: Display task before confirmation prompt
- FR-015: Delete only after 'y' confirmation
- FR-016: Success message after deletion
- FR-017: Cancellation message for 'n' response
- FR-021, FR-022: Type hints and docstring

#### Contract 3: toggle_complete_flow

**Purpose**: Interactive flow for toggling task completion status

**Signature**:
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
```

**Behavior**:
1. Prompt for task ID with validation (try-except ValueError)
2. Retrieve task via storage.get()
3. If not found: display "❌ Task #[ID] not found", return
4. Calculate new status: `new_status = not task.completed`
5. Call storage.update(id, completed=new_status)
6. Display status-specific message:
   - If now complete: "✓ Task marked as complete!" with [☑] icon
   - If now incomplete: "✓ Task marked as incomplete!" with [☐] icon
7. Display updated task via Todo.__str__()
8. Wait for Enter before returning

**Acceptance Tests**:
- FR-001, FR-002: ID validation with ValueError handling
- FR-003, FR-004: Existence checking with error message
- FR-018: Toggle completed boolean (True↔False)
- FR-019: "Task marked as complete!" message when completed
- FR-020: "Task marked as incomplete!" message when incomplete
- FR-021, FR-022: Type hints and docstring

#### Contract 4: main.py Integration

**Purpose**: Wire menu options 3, 4, 5 to new flows

**Changes Required**:
```python
# In main.py imports (line 8-14), add:
from cli import (
    display_menu,
    get_user_choice,
    clear_screen,
    add_task_flow,
    view_tasks_flow,
    update_task_flow,      # NEW
    delete_task_flow,      # NEW
    toggle_complete_flow   # NEW
)

# In main() function, replace lines 37-39:
elif choice == 3:
    update_task_flow(storage)
elif choice == 4:
    delete_task_flow(storage)
elif choice == 5:
    toggle_complete_flow(storage)
```

**Acceptance Tests**:
- FR-023: Menu options 3, 4, 5 call respective flows
- Integration: All flows work in main application loop
- Navigation: All flows return to menu after completion

---

## Phase 2: Implementation Quickstart

This guide will be used by `/sp.tasks` to generate detailed implementation tasks.

### Implementation Order (Priority-Based)

Per spec priorities (P1, P2, P3), implement in this order:

1. **toggle_complete_flow** (P1) - Simplest, most valuable standalone
2. **update_task_flow** (P2) - More complex but commonly needed
3. **delete_task_flow** (P3) - Confirmation loop adds complexity
4. **main.py integration** (Final) - Wire all flows to menu

### Code Organization

**File: src/cli.py**

Add three new functions after existing `view_tasks_flow()` (after line 162):
- `update_task_flow(storage: TodoStorage) -> None` (~45 lines with docstring)
- `delete_task_flow(storage: TodoStorage) -> None` (~40 lines with docstring)
- `toggle_complete_flow(storage: TodoStorage) -> None` (~35 lines with docstring)

Estimated total addition: ~120 lines to cli.py

**File: src/main.py**

Modify imports and main() function:
- Add 3 function names to import statement (line 12)
- Replace lines 37-39 with actual flow calls

Estimated total changes: 5 lines modified

### Implementation Patterns (Copy from Existing Code)

**Pattern 1: ID Input and Validation** (for all three flows)
```python
# Step 1: Get task ID with validation
try:
    task_id_str = input("Enter task ID: ").strip()
    task_id = int(task_id_str)
except ValueError:
    print("❌ Invalid ID format. Please enter a number.")
    input("\nPress Enter to continue...")
    return
```

**Pattern 2: Existence Checking** (for all three flows)
```python
# Step 2: Check task exists
task = storage.get(task_id)
if task is None:
    print(f"❌ Task #{task_id} not found")
    input("\nPress Enter to continue...")
    return
```

**Pattern 3: Display Task** (for update and delete flows)
```python
# Step 3: Show current task
print("\nCurrent task:")
print(task)  # Uses Todo.__str__()
print()
```

**Pattern 4: Skippable Input** (for update flow only)
```python
# Step 4: Get new title (skippable)
new_title = input("New title (or press Enter to skip): ").strip()
# Empty string after strip = skip update
```

**Pattern 5: Success Message** (for all three flows)
```python
# Final step: Success confirmation
print("\n✓ Task updated!")  # or "deleted!" or "marked as complete!"
print(task)  # Show result
input("\nPress Enter to continue...")
```

### Testing Checklist (Manual)

For each flow, test these scenarios:

**update_task_flow**:
- [ ] Valid ID, update title only
- [ ] Valid ID, update description only
- [ ] Valid ID, update both fields
- [ ] Valid ID, skip both fields (no changes)
- [ ] Invalid ID format (non-numeric)
- [ ] Non-existent ID
- [ ] Empty title (should re-prompt)
- [ ] Title with >100 chars (should re-prompt)
- [ ] Whitespace-only title (should re-prompt)

**delete_task_flow**:
- [ ] Valid ID, confirm 'y' (task deleted)
- [ ] Valid ID, confirm 'n' (task preserved)
- [ ] Valid ID, invalid confirmation first, then 'y'
- [ ] Valid ID, invalid confirmation first, then 'n'
- [ ] Case insensitive confirmation ('Y', 'N')
- [ ] Invalid ID format (non-numeric)
- [ ] Non-existent ID

**toggle_complete_flow**:
- [ ] Incomplete task → complete (check ☑ icon)
- [ ] Complete task → incomplete (check ☐ icon)
- [ ] Invalid ID format (non-numeric)
- [ ] Non-existent ID
- [ ] Toggle same task twice (verify it returns to original state)

**main.py Integration**:
- [ ] Menu option 3 launches update flow
- [ ] Menu option 4 launches delete flow
- [ ] Menu option 5 launches toggle flow
- [ ] All flows return to menu after completion
- [ ] All flows work after other operations in same session

### Edge Cases to Handle

From spec.md edge cases section:

1. **Extremely long input** (10k chars):
   - Not handled in Phase I (acceptable per MVP scope)
   - Title validation at 100 chars sufficient
   - Description has no length limit (Python string capacity)

2. **Concurrent operations**:
   - Not applicable (single-user CLI per constitution)

3. **storage.get() None vs exception**:
   - Verified: returns None (src/storage.py:55)
   - All flows use `if task is None` pattern

4. **Negative task IDs**:
   - Not explicitly blocked in validation
   - Will fail existence check (storage uses auto-increment starting at 1)
   - Acceptable behavior (displays "Task #-5 not found")

5. **Whitespace-only title** (e.g., "   "):
   - Handled by `.strip()` then empty check
   - Treats same as empty input (skip or error depending on context)

6. **Storage unavailable**:
   - Not applicable (in-memory storage in same process)
   - Phase II concern when file persistence added

7. **Modification race conditions**:
   - Not applicable (single-threaded CLI)

---

## Constitution Check (Post-Design)

*Re-evaluated after Phase 1 design completion.*

### Core Principles Compliance (Re-check)

- ✅ **Principle I: Spec-Driven Development** - Plan follows spec.md exactly
- ✅ **Principle II: Claude Code as Primary Tool** - No manual coding planned
- ✅ **Principle III: Clean Architecture** - All changes in cli.py and main.py only
- ✅ **Principle IV: Type Safety and Documentation** - All contracts include type hints and docstrings
- ✅ **Principle V: Robust Error Handling** - All error paths documented with user-friendly messages
- ✅ **Principle VI: Standard Library Only** - Zero external dependencies added
- ✅ **Principle VII: Evolution Readiness** - No Phase I decisions that block future phases

### Code Quality Standards (Re-check)

- ✅ **Function Length** - Each flow ~35-45 lines (under 50 line threshold with docstrings)
- ✅ **Module Length** - cli.py will be ~280 lines (under 300 line limit)
- ✅ **Descriptive Naming** - clear function names, no abbreviations
- ✅ **DRY** - Acceptable duplication for 3 flows (per Decision 4)

### Development Workflow (Re-check)

- ✅ **CRUD Operations** - Completes 3 of 5 required operations
- ✅ **Testing** - Manual testing checklist provided for all flows
- ✅ **Specification Traceability** - All 23 functional requirements mapped to implementation

**FINAL GATE STATUS: ✅ PASSED** - All constitutional requirements satisfied post-design. No violations introduced during planning.

---

## Next Steps

This plan is complete and ready for task generation:

1. **Immediate**: Run `/sp.tasks` to generate actionable implementation tasks
2. **Implementation**: Execute tasks via Claude Code in priority order (P1→P2→P3)
3. **Testing**: Use manual testing checklist for each completed flow
4. **Commit**: One commit per completed flow (3 implementation commits + 1 integration commit)

**Estimated Complexity**: Low-Medium (3 similar flows following established patterns, ~120 lines total)

**Estimated Implementation Time**: 4 tasks (toggle, update, delete, integration) - each independently testable
