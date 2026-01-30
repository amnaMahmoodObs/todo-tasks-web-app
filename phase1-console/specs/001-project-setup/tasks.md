---
description: "Task list for project setup - core architecture and classes"
---

# Tasks: Project Setup - Core Architecture and Classes

**Input**: Design documents from `/specs/001-project-setup/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md

**Tests**: This feature does NOT include automated tests. Manual testing via CLI only per constitution (Phase I defers automated tests to Phase II).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create src/ directory for application code
- [X] T002 Create tests/ directory structure (tests/contract/, tests/integration/, tests/unit/) - empty per Phase I constitution
- [X] T003 [P] Create pyproject.toml with project metadata (name: todo-console-app, Python 3.13+ requirement)

**Checkpoint**: ✅ Project structure ready for code implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] [US2] Create Todo class in src/todo.py with __init__ method taking id, title, description="", completed=False, created_at=None
- [X] T005 [P] [US2] Add type hints to Todo.__init__: id: int, title: str, description: str, completed: bool, created_at: datetime | None
- [X] T006 [US2] Add title validation in Todo.__init__: raise ValueError if title is empty or exceeds 100 characters
- [X] T007 [US2] Add auto-set created_at logic in Todo.__init__: if None, set to datetime.now()
- [X] T008 [US2] Implement Todo.__str__ method returning formatted string with checkbox symbols (☐ for not completed, ☑ for completed)
- [X] T009 [US2] Implement Todo.__repr__ method returning debug string with all attributes
- [X] T010 [US2] Add Google-style docstrings to Todo class and all methods in src/todo.py
- [X] T011 [P] [US2] Create TodoStorage class in src/storage.py with __init__ initializing _todos={} and _next_id=1
- [X] T012 [US2] Implement TodoStorage.add(todo: Todo) -> int method: assign id, store, increment counter, return id
- [X] T013 [US2] Implement TodoStorage.get(id: int) -> Todo | None method: return _todos.get(id, None)
- [X] T014 [US2] Implement TodoStorage.get_all() -> list[Todo] method: return sorted list by id
- [X] T015 [US2] Implement TodoStorage.update(id, title=None, description=None, completed=None) -> bool method with partial update logic
- [X] T016 [US2] Implement TodoStorage.delete(id: int) -> bool method: remove if exists, return success status
- [X] T017 [US2] Add Google-style docstrings to TodoStorage class and all methods in src/storage.py

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Application Startup and Navigation (Priority: P1) 🎯 MVP

**Goal**: Build working application shell with menu navigation and clean exit

**Independent Test**: Run `uv run src/main.py`, verify menu displays, test all 6 options including clean exit

### Implementation for User Story 1

- [X] T018 [P] [US1] Create display_menu() function in src/cli.py printing menu header and 6 numbered options
- [X] T019 [P] [US1] Create get_user_choice() function in src/cli.py with input validation (1-6) and friendly error messages
- [X] T020 [P] [US1] Create clear_screen() function in src/cli.py with OS detection (platform.system()) and appropriate clear command
- [X] T021 [US1] Add type hints to all cli.py functions: display_menu() -> None, get_user_choice() -> int, clear_screen() -> None
- [X] T022 [US1] Add Google-style docstrings to all functions in src/cli.py
- [X] T023 [US1] Create main() function in src/main.py initializing TodoStorage and implementing while True event loop
- [X] T024 [US1] Add option routing logic in main(): handle option 6 (exit with goodbye message), options 1-5 (show placeholder)
- [X] T025 [US1] Add if __name__ == "__main__": main() guard to src/main.py
- [X] T026 [US1] Add type hints and Google-style docstring to main() -> None in src/main.py
- [X] T027 [US1] Add import statements to src/main.py: TodoStorage from storage, display_menu, get_user_choice, clear_screen from cli

**Checkpoint**: ✅ User Story 1 fully functional - application runs, menu displays, all options respond correctly, exit works cleanly

---

## Phase 4: User Story 2 - Data Model Foundation (Priority: P1)

**Goal**: Verify data layer works correctly with storage operations

**Independent Test**: Create test todos, verify storage operations (add, get, get_all, update, delete), check checkbox symbols in __str__

**Note**: User Story 2 implementation is COMPLETE in Phase 2 (Foundational). This phase is for validation only.

### Validation for User Story 2

- [X] T028 [US2] Manually test Todo class instantiation with various inputs in Python REPL
- [X] T029 [US2] Manually test Todo.__str__ displays correct checkbox symbols (☐/☑) in Python REPL
- [X] T030 [US2] Manually test TodoStorage operations: add multiple todos, verify auto-increment IDs start at 1
- [X] T031 [US2] Manually test TodoStorage.get_all() returns todos sorted by ID in Python REPL
- [X] T032 [US2] Manually test TodoStorage.update() partial updates (change only title, only completed, etc.)
- [X] T033 [US2] Manually test TodoStorage.get() and delete() with non-existent IDs return None/False (no exceptions)

**Checkpoint**: ✅ Data model verified working - all storage operations functional, ready for CRUD feature implementation

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and validation

- [X] T034 [P] Verify all functions comply with 25-line limit (excluding docstrings) per constitution
- [X] T035 [P] Verify all modules comply with 300-line limit per constitution
- [X] T036 Run PEP 8 linter on all src/ files, fix any violations
- [X] T037 Verify all public functions have complete Google-style docstrings
- [X] T038 Verify all function signatures have type hints (parameters and return values)
- [X] T039 Test application end-to-end: startup, navigate all menu options, verify error handling, clean exit
- [X] T040 Test edge cases: empty input, whitespace, special characters, out-of-range numbers
- [X] T041 Verify no stack traces shown to user for any error condition
- [X] T042 Test rapid menu selections (options 1-5, then 6 to exit) to verify no performance issues
- [X] T043 Verify quickstart.md instructions work correctly (can run `uv run src/main.py`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-4)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3) can start immediately after Foundational
  - User Story 2 (Phase 4) is validation only (implementation in Phase 2)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (US1)**: Can start after Foundational (Phase 2) - No dependencies on US2
- **User Story 2 (US2)**: Implemented in Foundational (Phase 2) - Validation only in Phase 4

### Within Each User Story

**User Story 1 (Application Shell)**:
- T018, T019, T020 can run in parallel (different functions, no dependencies)
- T021, T022 depend on T018-T020 completing (add type hints/docs to existing functions)
- T023-T027 sequential (main() depends on cli functions existing)

**User Story 2 (Data Model)**:
- T004, T005, T011 can run in parallel (different classes)
- T006-T010 sequential (todo.py development)
- T012-T017 sequential (storage.py development)
- T028-T033 sequential (manual validation tests)

### Parallel Opportunities

- **Setup (Phase 1)**: T001, T002, T003 can all run in parallel
- **Foundational (Phase 2)**: T004, T005, T011 can run in parallel (different files)
- **User Story 1 (Phase 3)**: T018, T019, T020 can run in parallel (different functions)

---

## Parallel Example: Foundational Phase

```bash
# Launch in parallel (different files, no dependencies):
Task T004: Create Todo class skeleton in src/todo.py
Task T005: Add type hints to Todo.__init__
Task T011: Create TodoStorage class skeleton in src/storage.py

# Then sequential:
Task T006-T010: Complete todo.py
Task T012-T017: Complete storage.py
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks everything)
3. Complete Phase 3: User Story 1 (Application Shell)
4. **STOP and VALIDATE**: Test application runs, menu works, exit works
5. Deploy/demo if ready (working CLI with placeholder messages)

### Full Foundation (Both User Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Working application shell
3. Validate User Story 2 → Test independently → Data layer verified
4. Polish → Final validation
5. **Ready for CRUD feature implementation**

### Recommended Order

**Priority**: Both User Stories are P1 (foundation), but:
1. **Foundational Phase (Phase 2)** includes US2 implementation - MUST complete first
2. **User Story 1 (Phase 3)** provides visible MVP - implement second
3. **User Story 2 Validation (Phase 4)** - validate third
4. **Polish (Phase 5)** - final checks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable (though US1 depends on US2 data layer)
- No automated tests in this feature per constitution (Phase I = manual testing only)
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Avoid: vague tasks, same file conflicts, implementation without type hints/docstrings

---

## Summary

- **Total Tasks**: 43
- **Setup**: 3 tasks
- **Foundational**: 14 tasks (US2 implementation)
- **User Story 1**: 10 tasks
- **User Story 2 Validation**: 6 tasks
- **Polish**: 10 tasks
- **Parallel Opportunities**: 9 tasks can run in parallel across phases
- **MVP Scope**: Phases 1-3 (27 tasks) deliver working application shell
- **Estimated Module Sizes**: todo.py (~60 lines), storage.py (~70 lines), cli.py (~75 lines), main.py (~50 lines)
