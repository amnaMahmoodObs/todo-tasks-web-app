# Implementation Plan: Project Setup - Core Architecture and Classes

**Branch**: `001-project-setup` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-setup/spec.md`

## Summary

This feature establishes the foundational architecture for the Phase I todo console application. It creates the core data model (Todo class), in-memory storage layer (TodoStorage), CLI framework (menu system and input validation), and application entry point. This is a blocking prerequisite for all CRUD features.

**Primary Requirement**: Build working application shell with menu navigation, graceful error handling, and complete data/storage infrastructure ready for feature implementation.

**Technical Approach**: Python 3.13+ standard library only, four-module clean architecture (main.py, cli.py, todo.py, storage.py), type-safe with full docstrings, manual testing via `uv run src/main.py`.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Python standard library only (datetime, os/platform for clear screen)
**Storage**: In-memory dictionary (Phase I), swappable interface for Phase II+ persistence
**Testing**: Manual testing via CLI interaction (automated tests deferred to Phase II)
**Target Platform**: Cross-platform terminal/console (macOS, Linux, Windows)
**Project Type**: Single project (console application)
**Performance Goals**: <1s startup, <1s exit, handles 1000+ consecutive operations, supports 100+ stored todos
**Constraints**: No external dependencies, PEP 8 compliant, 25-line function limit, type hints required
**Scale/Scope**: Single-user local CLI, 4 modules (~50-75 lines each), foundation for 5-phase evolution

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: Spec provides 28 functional requirements with clear MUST statements
- ✅ **PASS**: All modules, classes, and methods explicitly defined in spec
- ✅ **PASS**: No implementation to begin until plan approved

### Principle II: Claude Code as Primary Tool
- ✅ **PASS**: All code generation via Claude Code from this plan and spec
- ✅ **PASS**: Plan written for Claude Code autonomous implementation

### Principle III: Clean Architecture
- ✅ **PASS**: Exactly 4 modules as specified in constitution:
  - `src/main.py` - Application entry point and event loop
  - `src/cli.py` - User interface (menu, input, display)
  - `src/todo.py` - Todo class (data model)
  - `src/storage.py` - TodoStorage class (persistence layer)
- ✅ **PASS**: Clear separation of concerns maintained

### Principle IV: Type Safety and Documentation
- ✅ **PASS**: Spec requires type hints on all functions (FR-024)
- ✅ **PASS**: Spec requires Google-style docstrings (FR-025)
- ✅ **PASS**: Return and parameter annotations mandatory

### Principle V: Robust Error Handling
- ✅ **PASS**: Input validation required (FR-015, FR-016)
- ✅ **PASS**: Friendly error messages required (FR-016, FR-022)
- ✅ **PASS**: No stack traces to users (FR-022, User Story 1 Scenario 6)
- ✅ **PASS**: 6 edge cases identified in spec

### Principle VI: Standard Library Only
- ✅ **PASS**: No external dependencies (FR-028)
- ✅ **PASS**: Python 3.13+ standard library only

### Principle VII: Evolution Readiness
- ✅ **PASS**: Storage interface designed for Phase II swapping
- ✅ **PASS**: Evolution considerations documented for Phases II-V
- ✅ **PASS**: No global state (storage passed as dependency)

**Constitution Compliance**: ✅ **ALL GATES PASSED** (7/7 principles satisfied)

## Project Structure

### Documentation (this feature)

```text
specs/001-project-setup/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan output)
├── research.md          # Phase 0 research (not needed - no unknowns)
├── data-model.md        # Phase 1 data model design
├── quickstart.md        # Phase 1 usage guide
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
src/
├── main.py       # Application entry point (~50 lines)
│                 # - main() function
│                 # - TodoStorage initialization
│                 # - Main event loop
│                 # - Option routing
│                 # - Exit handling
│
├── cli.py        # CLI interface functions (~75 lines)
│                 # - display_menu() → void
│                 # - get_user_choice() → int
│                 # - clear_screen() → void
│
├── todo.py       # Todo class definition (~60 lines)
│                 # - Todo class with 5 attributes
│                 # - __init__(id, title, description, completed, created_at)
│                 # - __str__() with checkbox symbols
│                 # - __repr__() for debugging
│
└── storage.py    # TodoStorage class (~70 lines)
                  # - TodoStorage class
                  # - __init__() → None
                  # - add(todo: Todo) → int
                  # - get(id: int) → Todo | None
                  # - get_all() → list[Todo]
                  # - update(id, title?, desc?, completed?) → bool
                  # - delete(id: int) → bool

tests/            # Testing structure (no tests in Phase I)
├── contract/     # Created but empty (Phase II+)
├── integration/  # Created but empty (Phase II+)
└── unit/         # Created but empty (Phase II+)
```

**Structure Decision**: Single project layout chosen. This is a standalone CLI application with no frontend/backend split needed. The `src/` directory contains all application code organized by responsibility (UI, data model, storage, orchestration). Test directories created but empty per constitution (Phase I uses manual testing).

## Module Design

### src/todo.py - Data Model

**Purpose**: Define the Todo entity with all required attributes and display methods.

**Class: Todo**
- Attributes (5 required):
  - `id`: int - Unique identifier (assigned by storage)
  - `title`: str - Task title (max 100 chars per constitution)
  - `description`: str - Optional detailed description
  - `completed`: bool - Completion status (default False)
  - `created_at`: datetime - Auto-set timestamp

- Methods:
  - `__init__(self, id: int, title: str, description: str = "", completed: bool = False, created_at: datetime | None = None) -> None`
    - If created_at is None, set to datetime.now()
    - Validate title not empty (raise ValueError)
    - Validate title <= 100 chars (raise ValueError)

  - `__str__(self) -> str`
    - Format: "[☑] ID: {id} - {title}" if completed
    - Format: "[☐] ID: {id} - {title}" if not completed
    - Include description if present

  - `__repr__(self) -> str`
    - Format: "Todo(id={id}, title='{title}', description='{description}', completed={completed}, created_at={created_at})"

**Type Hints**: All parameters and return types annotated
**Docstrings**: Google-style for class and all methods
**Validation**: Title required and <= 100 chars
**Evolution**: Attributes align with SQL types for Phase III

### src/storage.py - Persistence Layer

**Purpose**: Manage in-memory todo collection with CRUD operations.

**Class: TodoStorage**
- Internal state:
  - `_todos`: dict[int, Todo] - Storage dictionary
  - `_next_id`: int - Counter for ID assignment (starts at 1)

- Methods:
  - `__init__(self) -> None`
    - Initialize empty _todos dict
    - Set _next_id to 1

  - `add(self, todo: Todo) -> int`
    - Assign todo.id = self._next_id
    - Store in _todos[todo.id] = todo
    - Increment _next_id
    - Return assigned ID

  - `get(self, id: int) -> Todo | None`
    - Return _todos.get(id, None)
    - Never raise KeyError

  - `get_all(self) -> list[Todo]`
    - Return sorted(self._todos.values(), key=lambda t: t.id)
    - Empty list if no todos

  - `update(self, id: int, title: str | None = None, description: str | None = None, completed: bool | None = None) -> bool`
    - Get todo = self.get(id)
    - If todo is None, return False
    - If title provided, validate and update todo.title
    - If description provided, update todo.description
    - If completed provided, update todo.completed
    - Return True

  - `delete(self, id: int) -> bool`
    - If id in _todos: del _todos[id], return True
    - Else: return False

**Type Hints**: All methods fully annotated with Python 3.10+ union syntax
**Docstrings**: Google-style for class and all methods
**Interface Design**: Methods return types compatible with future persistence backends
**Evolution**: Swappable for file/SQLite storage in future phases

### src/cli.py - User Interface

**Purpose**: Provide terminal UI functions for menu display, input collection, and screen management.

**Functions:**

- `display_menu() -> None`
  - Print menu header (e.g., "=== Todo App Menu ===")
  - Print 6 numbered options:
    1. Add Task
    2. View Tasks
    3. Update Task
    4. Delete Task
    5. Mark Complete
    6. Exit
  - Print separator line

- `get_user_choice() -> int`
  - Prompt: "Enter your choice (1-6): "
  - Read input with input()
  - Try: convert to int
  - Catch ValueError: print "Error: Invalid input. Please enter a number between 1 and 6."
  - Validate 1 <= choice <= 6
  - If out of range: print "Error: Choice must be between 1 and 6. Please try again."
  - Return valid choice
  - Loop until valid input received

- `clear_screen() -> None`
  - Detect OS with platform.system()
  - If Windows: os.system('cls')
  - Else (macOS/Linux): os.system('clear')

**Type Hints**: All functions annotated
**Docstrings**: Google-style for each function
**Error Messages**: Follow "Error: [problem]. [suggestion]." format from constitution
**Imports**: os, platform from standard library

### src/main.py - Application Entry Point

**Purpose**: Orchestrate application lifecycle - initialization, event loop, and shutdown.

**Function: main() -> None**

1. Initialize storage:
   ```python
   storage = TodoStorage()
   ```

2. Main event loop:
   ```python
   while True:
       clear_screen()
       display_menu()
       choice = get_user_choice()

       if choice == 6:
           print("\nThank you for using Todo App. Goodbye!")
           break
       elif choice in [1, 2, 3, 4, 5]:
           print("\n⚠️  Feature not yet implemented")
           input("\nPress Enter to continue...")
       # Future: route to feature implementations
   ```

3. Entry point guard:
   ```python
   if __name__ == "__main__":
       main()
   ```

**Type Hints**: main() -> None
**Docstrings**: Google-style for main()
**Imports**: TodoStorage from storage, display_menu, get_user_choice, clear_screen from cli
**Error Handling**: All errors handled in called functions
**Exit**: Clean exit with goodbye message

## Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Summary**: Single entity (Todo) with 5 attributes aligned to constitution requirements. TodoStorage provides repository pattern interface for CRUD operations.

## Quickstart

See [quickstart.md](./quickstart.md) for setup and usage instructions.

**Summary**:
1. Ensure Python 3.13+ installed
2. Run `uv run src/main.py`
3. Navigate menu with numbers 1-6
4. Option 6 exits cleanly
5. Options 1-5 show "not implemented" placeholder

## Implementation Notes

### Module Implementation Order

1. **src/todo.py** (no dependencies)
   - Start here - pure data class
   - Implement and verify __str__ checkbox symbols
   - Test __repr__ for debugging output

2. **src/storage.py** (depends on Todo)
   - Import Todo from todo
   - Implement CRUD operations
   - Verify ID auto-increment starts at 1

3. **src/cli.py** (no domain dependencies)
   - OS detection for clear screen
   - Input validation with friendly errors
   - Menu display formatting

4. **src/main.py** (depends on storage, cli)
   - Import all required components
   - Wire together event loop
   - Test option routing

### Type Hint Patterns

```python
# Python 3.10+ union syntax (preferred)
from datetime import datetime

def get(self, id: int) -> Todo | None:
    """Get todo by ID or None if not found."""
    pass

def update(self, id: int, title: str | None = None,
           description: str | None = None,
           completed: bool | None = None) -> bool:
    """Update todo fields. Only provided fields are modified."""
    pass
```

### Google Docstring Template

```python
def add(self, todo: Todo) -> int:
    """Add a todo to storage and assign unique ID.

    Args:
        todo: Todo instance to add to storage.

    Returns:
        Assigned integer ID for the todo.

    Note:
        The todo's id attribute will be modified to the assigned ID.
    """
    pass
```

### Error Message Examples

**Good (follows constitution format):**
- "Error: Invalid input. Please enter a number between 1 and 6."
- "Error: Choice must be between 1 and 6. Please try again."

**Bad (don't use these):**
- "Invalid choice" (no suggestion)
- "ValueError: invalid literal for int()" (stack trace)
- "Bad input!" (not actionable)

### Edge Case Handling

| Edge Case | Handling Strategy |
|-----------|------------------|
| Empty string input | Caught by ValueError in int() conversion, show friendly error |
| Whitespace input | Caught by ValueError, same as empty |
| Special chars (!, @, etc.) | Caught by ValueError, same error message |
| Very long input (>100 chars) | Caught by ValueError during int conversion (not a Todo validation issue yet) |
| Ctrl+C interrupt | KeyboardInterrupt - allow default Python handling (exits) |
| Rapid menu selections | No special handling needed (in-memory operations fast enough) |
| Unicode in todos | Supported natively by Python 3.13+ strings |
| Todos across dates | Display created_at as-is (formatting deferred to View feature) |

### Performance Considerations

- **Startup**: Import only standard library (fast)
- **Menu display**: Simple print statements (instant)
- **Input validation**: Single int conversion (negligible)
- **Clear screen**: OS command (typically <50ms)
- **Loop iteration**: No sleep/delays, immediate response
- **Memory**: 4 small modules + storage dict (KB range)

**Expected**: All success criteria (<1s startup, <1s exit, handles 1000+ ops) easily met with this design.

## Complexity Tracking

> No constitution violations detected. This section intentionally empty.

## Post-Phase 1 Constitution Re-check

*To be filled after data-model.md and quickstart.md generated*

**Status**: ✅ **PENDING PHASE 1 COMPLETION**

Will re-validate:
- Data model aligns with constitution Todo definition (5 attributes)
- Module structure matches constitutional clean architecture
- No external dependencies introduced during design
- Type hints and docstrings specified in all designs

---

**Next Step**: Generate Phase 1 artifacts (data-model.md, quickstart.md), then proceed to `/sp.tasks` for task breakdown.
