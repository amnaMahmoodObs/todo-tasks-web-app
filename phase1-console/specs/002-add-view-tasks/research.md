# Research: Add and View Tasks

**Feature**: 002-add-view-tasks | **Date**: 2026-01-22

## Research Questions and Findings

### Q1: How should input validation loops be structured in Python CLI applications?

**Decision**: Use `while True` loop with validation logic and early return on success.

**Rationale**:
- Standard Python pattern for input validation
- Clean separation of validation logic
- User-friendly (no crashes, re-prompts on error)
- Matches existing `get_user_choice()` pattern in `cli.py:42-54`

**Alternatives Considered**:
- Recursive function calls: Risk of stack overflow with many retries
- Exception-based control flow: Anti-pattern in Python, reduces readability

**Implementation Pattern**:
```python
def get_validated_input(prompt: str, validator: callable) -> str:
    """Generic pattern for validated input collection."""
    while True:
        user_input = input(prompt)
        try:
            if validator(user_input):
                return user_input
            else:
                print("Validation error message")
        except Exception as e:
            print(f"Error: {e}")
```

---

### Q2: What's the best practice for displaying empty states in CLI applications?

**Decision**: Use emoji-enhanced helpful message with clear next action guidance.

**Rationale**:
- Reduces cognitive load for new users
- Provides immediate guidance on what to do next
- Matches modern CLI UX patterns (e.g., Git's helpful empty repo message)
- Spec explicitly requires: "📝 No tasks yet! Add your first task." (FR-011)

**Alternatives Considered**:
- Plain text only: Less engaging, harder to scan visually
- Silence (no message): Poor UX, leaves users confused
- Verbose tutorial: Too much information, overwhelming

**Implementation Example**:
```python
if not tasks:
    print()
    print("📝 No tasks yet! Add your first task.")
    print("   Select option 1 from the menu to get started.")
    print()
```

---

### Q3: How should we format task display with completion status indicators?

**Decision**: Use Unicode checkbox symbols (☐ ☑) with format: `[ID] ☐ Title`

**Rationale**:
- Spec explicitly requires this format (FR-012, FR-014)
- Visual scan-ability: checkboxes are immediately recognizable
- Unicode support is standard in modern terminals (macOS/Linux/Windows 10+)
- Existing `Todo.__str__()` already uses checkbox pattern (see `todo.py:66`)

**Alternatives Considered**:
- ASCII only `[ ]` and `[x]`: Works on all terminals but less visually appealing
- Color coding: Requires terminal color support, increases complexity
- Status text ("Complete"/"Incomplete"): Takes more space, harder to scan

**Implementation Notes**:
- `Todo.__str__()` already implements this pattern correctly
- `view_tasks_flow()` can simply print each todo to get consistent formatting

---

### Q4: Should we strip whitespace from titles, and what are the validation rules?

**Decision**: Strip leading/trailing whitespace, validate non-empty after stripping, enforce 100-character limit.

**Rationale**:
- Spec requirements FR-002, FR-004, FR-004a, FR-004b explicitly define this behavior
- Prevents accidental whitespace-only titles
- User-friendly: auto-corrects common input errors
- Existing `Todo.__init__()` already validates empty and length (see `todo.py:41-44`)

**Validation Sequence**:
1. Strip whitespace: `title = title.strip()`
2. Check non-empty: `if not title: error`
3. Check length: `if len(title) > 100: error`
4. Pass validated title to `Todo` constructor

**Implementation Pattern**:
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

---

### Q5: How should we handle the optional description field?

**Decision**: Prompt separately after title validation, allow empty input (press Enter to skip).

**Rationale**:
- Spec requirements FR-005, FR-006 explicitly define this behavior
- Two-step flow reduces cognitive load (one decision at a time)
- Empty description is semantically different from no input (user explicitly skipped)
- Matches common form patterns in CLI tools (e.g., `git commit` prompts)

**Implementation Pattern**:
```python
description = input("Description (optional, press Enter to skip): ").strip()
# Empty string is valid, no validation needed
```

**Alternatives Considered**:
- Single-line input with separator (e.g., "Title | Description"): Too complex, error-prone
- Multi-line input: Requires special handling, overly complex for Phase I

---

### Q6: What success message format should we use after adding a task?

**Decision**: Display "✓ Task #[ID] added successfully!" followed by formatted task details.

**Rationale**:
- Spec explicitly requires this format (FR-009)
- Provides immediate feedback with assigned ID
- Shows full task representation for user verification
- Matches existing `Todo.__str__()` output format

**Implementation Pattern**:
```python
task_id = storage.add(new_todo)
print(f"\n✓ Task #{task_id} added successfully!")
print(new_todo)  # Uses Todo.__str__() for consistent formatting
print()
```

---

### Q7: How do we integrate with the existing menu system in main.py?

**Decision**: Update menu options 1 and 2 to call `add_task_flow(storage)` and `view_tasks_flow(storage)` respectively.

**Rationale**:
- Spec requirements FR-015, FR-016 explicitly define this integration
- Existing `main.py` already has menu infrastructure (`display_menu()`, `get_user_choice()`)
- Clean separation: flow functions in `cli.py`, orchestration in `main.py`
- Matches clean architecture principle (constitution III)

**Implementation Pattern** (in `main.py`):
```python
from cli import display_menu, get_user_choice, clear_screen, add_task_flow, view_tasks_flow
from storage import TodoStorage

storage = TodoStorage()

while True:
    clear_screen()
    display_menu()
    choice = get_user_choice()

    if choice == 1:
        add_task_flow(storage)
    elif choice == 2:
        view_tasks_flow(storage)
    # ... other options
```

---

## Technology Stack Validation

| Component | Technology | Validated |
|-----------|------------|-----------|
| Language | Python 3.13+ | ✅ Confirmed in existing codebase |
| Input/Output | `input()`, `print()` | ✅ Standard library, already in use |
| Storage | `TodoStorage` class | ✅ Exists at `src/storage.py`, fully implemented |
| Data Model | `Todo` class | ✅ Exists at `src/todo.py`, fully implemented with validation |
| Terminal Control | `os.system()`, `platform.system()` | ✅ Already in use in `cli.py:64-68` |
| Type Hints | Python 3.13+ type syntax | ✅ Used throughout existing codebase |

---

## Integration Points

### Existing Code We Depend On

1. **`Todo` class** (`src/todo.py:10-86`):
   - Constructor with validation (lines 21-51)
   - `__str__()` method for display formatting (lines 53-70)
   - Attributes: `id`, `title`, `description`, `completed`, `created_at`

2. **`TodoStorage` class** (`src/storage.py:10-124`):
   - `add(todo)` method assigns ID and stores (lines 26-41)
   - `get_all()` method returns sorted list (lines 57-64)
   - ID auto-increment starting at 1 (line 24)

3. **CLI utilities** (`src/cli.py:12-68`):
   - `display_menu()` for main menu (lines 12-25)
   - `get_user_choice()` for validated menu input (lines 28-54)
   - `clear_screen()` for terminal clearing (lines 57-68)

### New Code We Will Create

1. **`add_task_flow(storage: TodoStorage) -> None`** in `src/cli.py`:
   - Prompt for title with validation loop
   - Prompt for optional description
   - Create `Todo` instance
   - Call `storage.add()`
   - Display success message with task details

2. **`view_tasks_flow(storage: TodoStorage) -> None`** in `src/cli.py`:
   - Call `storage.get_all()`
   - If empty: display friendly empty state message
   - Else: display formatted list of tasks

3. **Menu wiring** in `src/main.py` and `main.py`:
   - Import new flow functions
   - Wire choice 1 → `add_task_flow(storage)`
   - Wire choice 2 → `view_tasks_flow(storage)`

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unicode symbols not rendering in some terminals | Low - Affects display only | Tested on macOS/Linux/Windows 10+. Fallback not needed per spec requirements. |
| Very long descriptions breaking terminal layout | Low - Edge case | Spec doesn't define max length for description. Trust terminal wrapping for Phase I. Consider length limit in later phases if needed. |
| Storage failing to persist task | Medium - Data loss | `TodoStorage.add()` never fails (in-memory dict). No file I/O in Phase I. |
| ID counter overflow | Very Low - Theoretical only | Python `int` type has arbitrary precision. Would need billions of tasks to be an issue. |

---

## Open Questions / Deferred to Later Phases

1. **Multi-line descriptions**: How to handle? → Deferred to Phase III (out of scope for Phase I).
2. **Task sorting options**: By date, priority, etc.? → Deferred to Phase IV (out of scope for Phase I).
3. **Pagination for large task lists**: What if 10,000 tasks? → Addressed by SC-004 performance requirement (1000 tasks). Pagination deferred to Phase III.
4. **Undo/redo for accidental additions**: Should we support? → Deferred to Phase IV (out of scope for Phase I).
