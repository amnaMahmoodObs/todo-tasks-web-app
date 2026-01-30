# Tasks: Task Operations (Update, Delete, Toggle Complete)

**Input**: Design documents from `/specs/003-task-operations/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: Manual testing only per constitution. No automated test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths below follow single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new setup required - existing project structure already has src/ directory with cli.py and main.py

**Status**: ✅ Complete (existing infrastructure sufficient)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify existing infrastructure supports new flows

**⚠️ CRITICAL**: Verify these prerequisites before ANY user story implementation

- [X] T001 Verify TodoStorage has get(), update(), delete() methods in src/storage.py (read-only verification)
- [X] T002 Verify Todo model has id, title, description, completed attributes in src/todo.py (read-only verification)
- [X] T003 Verify main.py has menu structure with options 3, 4, 5 ready for wiring in src/main.py (read-only verification)

**Checkpoint**: Foundation verified - user story implementation can now begin

---

## Phase 3: User Story 1 - Toggle Task Completion Status (Priority: P1) 🎯 MVP

**Goal**: Allow users to toggle task completion status (incomplete ↔ complete) by entering task ID

**Independent Test**: Create a task, toggle it to complete (verify ☑ icon), toggle back to incomplete (verify ☐ icon), verify status persists. This story delivers immediate value without requiring any other operations.

**Why MVP**: Simplest operation, most commonly used, independently testable, follows all existing patterns

### Implementation for User Story 1

- [X] T004 [US1] Implement toggle_complete_flow function in src/cli.py with type hints and docstring
- [X] T005 [US1] Add toggle_complete_flow to imports in src/main.py
- [X] T006 [US1] Wire menu option 5 to toggle_complete_flow in src/main.py
- [ ] T007 [US1] Manual test: Toggle incomplete task to complete (verify ☑ icon and success message)
- [ ] T008 [US1] Manual test: Toggle complete task to incomplete (verify ☐ icon and success message)
- [ ] T009 [US1] Manual test: Invalid task ID (non-numeric) shows error
- [ ] T010 [US1] Manual test: Non-existent task ID shows "Task #X not found"
- [ ] T011 [US1] Manual test: Toggle same task twice returns to original state

**Checkpoint**: User Story 1 complete and independently testable. MVP feature delivered!

---

## Phase 4: User Story 2 - Update Task Details (Priority: P2)

**Goal**: Allow users to update task title and/or description by entering task ID, with ability to skip unchanged fields

**Independent Test**: Create a task, update its title only (description unchanged), verify changes persist. Update description only (title unchanged), verify changes persist. Works independently without toggle or delete operations.

**Why P2**: Fundamental CRUD editing operation, more complex than toggle but more commonly needed than deletion

### Implementation for User Story 2

- [X] T012 [US2] Implement update_task_flow function in src/cli.py with type hints and docstring
- [X] T013 [US2] Add update_task_flow to imports in src/main.py
- [X] T014 [US2] Wire menu option 3 to update_task_flow in src/main.py
- [ ] T015 [US2] Manual test: Update title only (description unchanged)
- [ ] T016 [US2] Manual test: Update description only (title unchanged)
- [ ] T017 [US2] Manual test: Update both title and description
- [ ] T018 [US2] Manual test: Skip both fields shows "No changes provided"
- [ ] T019 [US2] Manual test: Empty title shows validation error
- [ ] T020 [US2] Manual test: Whitespace-only title shows validation error
- [ ] T021 [US2] Manual test: Title >100 chars shows validation error
- [ ] T022 [US2] Manual test: Invalid task ID shows error
- [ ] T023 [US2] Manual test: Non-existent task ID shows "Task #X not found"
- [ ] T024 [US2] Manual test: Update preserves completion status

**Checkpoint**: User Stories 1 AND 2 both work independently. Can toggle and update tasks!

---

## Phase 5: User Story 3 - Delete Task (Priority: P3)

**Goal**: Allow users to permanently delete tasks with explicit y/n confirmation to prevent accidental data loss

**Independent Test**: Create a task, delete it with 'y' confirmation, verify it no longer appears in task list. Create another task, attempt delete with 'n' confirmation, verify task is preserved. Works independently without toggle or update operations.

**Why P3**: Less frequently needed than completion or editing, requires confirmation loop complexity

### Implementation for User Story 3

- [X] T025 [US3] Implement delete_task_flow function in src/cli.py with type hints and docstring
- [X] T026 [US3] Add delete_task_flow to imports in src/main.py
- [X] T027 [US3] Wire menu option 4 to delete_task_flow in src/main.py
- [ ] T028 [US3] Manual test: Delete with 'y' confirmation removes task
- [ ] T029 [US3] Manual test: Delete with 'n' confirmation preserves task
- [ ] T030 [US3] Manual test: Invalid confirmation (not y/n) re-prompts
- [ ] T031 [US3] Manual test: Case insensitive confirmation ('Y', 'N') works
- [ ] T032 [US3] Manual test: Invalid task ID shows error
- [ ] T033 [US3] Manual test: Non-existent task ID shows "Task #X not found"
- [ ] T034 [US3] Manual test: Deleted task cannot be toggled or updated

**Checkpoint**: All three user stories complete and independently functional. Full CRUD operations available!

---

## Phase 6: Integration & Polish

**Purpose**: Verify all operations work together in complete workflows

- [ ] T035 [P] Integration test: Add task → Toggle → Update → Delete (full workflow)
- [ ] T036 [P] Integration test: All flows return to menu properly
- [ ] T037 [P] Integration test: Multiple operations in same session work correctly
- [ ] T038 [P] Integration test: View tasks reflects all changes correctly
- [ ] T039 [P] Integration test: Exit (option 6) still works after new flows
- [ ] T040 Run all manual tests from quickstart.md testing checklist
- [ ] T041 Verify all functions have Google-style docstrings and type hints
- [ ] T042 Verify all error messages use ❌ prefix and success messages use ✓ prefix
- [ ] T043 Verify PEP 8 compliance (indentation, line length, naming)

**Final Checkpoint**: Feature complete! All 5 CRUD operations implemented and tested.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: ✅ Complete (no new setup needed)
- **Phase 2 (Foundational)**: Read-only verification tasks - can complete quickly
- **Phase 3 (User Story 1)**: Depends on Phase 2 verification complete - **MVP TARGET**
- **Phase 4 (User Story 2)**: Depends on Phase 2 verification complete - Can start in parallel with US1 or after US1
- **Phase 5 (User Story 3)**: Depends on Phase 2 verification complete - Can start in parallel with US1/US2 or after US1+US2
- **Phase 6 (Integration)**: Depends on all three user stories being complete

### User Story Dependencies

- ✅ **User Story 1 (P1)**: INDEPENDENT - No dependencies on other stories, can start after Phase 2
- ✅ **User Story 2 (P2)**: INDEPENDENT - No dependencies on other stories, can start after Phase 2
- ✅ **User Story 3 (P3)**: INDEPENDENT - No dependencies on other stories, can start after Phase 2

**Key Insight**: All three user stories are completely independent! They can be implemented in any order or in parallel.

### Within Each User Story

1. Implement flow function in cli.py (T004, T012, T025)
2. Add import in main.py (T005, T013, T026)
3. Wire menu option in main.py (T006, T014, T027)
4. Run manual tests for that story (remaining tasks in each phase)

### Parallel Opportunities

**After Phase 2 verification completes, ALL three user stories can proceed in parallel:**

- Developer A: User Story 1 (T004-T011) → 8 tasks
- Developer B: User Story 2 (T012-T024) → 13 tasks
- Developer C: User Story 3 (T025-T034) → 10 tasks

**Within each user story:**
- Implementation tasks (T004-T006, T012-T014, T025-T027) must be sequential (same files)
- Manual testing tasks can run in parallel if multiple testers available

**Integration phase (Phase 6):**
- All integration test tasks (T035-T039) marked [P] can run in parallel
- Verification tasks (T040-T043) can run in parallel

---

## Parallel Example: After Phase 2 Complete

```bash
# Three developers can work simultaneously on different stories:

# Developer A - User Story 1 (Toggle):
Task: "Implement toggle_complete_flow function in src/cli.py"
Task: "Add toggle_complete_flow to imports in src/main.py"
Task: "Wire menu option 5 to toggle_complete_flow in src/main.py"
Task: "Manual test: Toggle operations"

# Developer B - User Story 2 (Update):
Task: "Implement update_task_flow function in src/cli.py"
Task: "Add update_task_flow to imports in src/main.py"
Task: "Wire menu option 3 to update_task_flow in src/main.py"
Task: "Manual test: Update operations"

# Developer C - User Story 3 (Delete):
Task: "Implement delete_task_flow function in src/cli.py"
Task: "Add delete_task_flow to imports in src/main.py"
Task: "Wire menu option 4 to delete_task_flow in src/main.py"
Task: "Manual test: Delete operations"
```

**Note**: If single developer, implement in priority order: US1 → US2 → US3

---

## Implementation Strategy

### MVP First (User Story 1 Only) ⭐ RECOMMENDED

1. ✅ Complete Phase 1: Setup (already done)
2. Complete Phase 2: Foundational verification (T001-T003) → ~5 minutes
3. Complete Phase 3: User Story 1 (T004-T011) → Toggle complete feature
4. **STOP and VALIDATE**: Test toggle independently with quickstart.md checklist
5. Deploy/demo toggle feature if ready

**MVP Deliverable**: Users can mark tasks complete/incomplete. Immediate value!

### Incremental Delivery (Recommended Sequence)

1. Complete Phase 2 verification → Foundation ready (~5 min)
2. Add User Story 1 → Test independently → **MVP** deployed! (Toggle complete)
3. Add User Story 2 → Test independently → Deploy update feature
4. Add User Story 3 → Test independently → Deploy delete feature
5. Complete Phase 6 integration testing → Full CRUD complete!

Each story adds value without breaking previous stories.

### Parallel Team Strategy (If Multiple Developers)

With 3 developers:

1. Everyone completes Phase 2 verification together (~5 min)
2. Once Phase 2 is done:
   - Developer A: User Story 1 (Toggle) - T004-T011
   - Developer B: User Story 2 (Update) - T012-T024
   - Developer C: User Story 3 (Delete) - T025-T034
3. Merge all three stories independently
4. Team runs Phase 6 integration tests together

**Timeline**: All three stories can complete in parallel, roughly 1-2 hours per story with testing.

### Single Developer Strategy (Priority Order)

Implement sequentially in priority order:

1. Phase 2 verification (5 min)
2. User Story 1: Toggle (P1) → MVP complete! (1-2 hours)
   - **Stop here for MVP if time-constrained**
3. User Story 2: Update (P2) → Edit capability added (1-2 hours)
4. User Story 3: Delete (P3) → Full CRUD complete (1-2 hours)
5. Phase 6: Integration testing (30 min)

**Total estimated time**: 3-6 hours for complete feature

---

## Task Count Summary

- **Phase 1 (Setup)**: 0 tasks (existing infrastructure)
- **Phase 2 (Foundational)**: 3 tasks (verification only)
- **Phase 3 (User Story 1 - P1)**: 8 tasks (1 implementation + 3 integration + 4 manual tests) ⭐ MVP
- **Phase 4 (User Story 2 - P2)**: 13 tasks (1 implementation + 3 integration + 9 manual tests)
- **Phase 5 (User Story 3 - P3)**: 10 tasks (1 implementation + 3 integration + 6 manual tests)
- **Phase 6 (Integration & Polish)**: 9 tasks (5 integration + 4 verification)
- **Total**: 43 tasks

**Breakdown by Type**:
- Verification: 3 tasks
- Implementation: 9 tasks (3 functions + 3 imports + 3 wiring)
- Manual Testing: 23 tasks (story-specific tests)
- Integration Testing: 5 tasks
- Quality Verification: 4 tasks

**Parallel Opportunities**: 3 user stories can proceed in parallel after Phase 2 (up to 3x speedup with multiple developers)

**MVP Scope**: Phase 2 (3 tasks) + Phase 3 (8 tasks) = 11 tasks total for toggle complete feature

---

## Implementation Notes

### Code Patterns (from quickstart.md)

Each flow follows the same structure:
1. ID input with ValueError handling (Pattern 2)
2. Existence check via storage.get() (Pattern 3)
3. Operation-specific logic
4. Success message with task display (Pattern 5)
5. Wait for Enter before returning

### File Modification Strategy

- **src/cli.py**: Add 3 new functions (~120 lines total)
  - toggle_complete_flow (~35 lines)
  - update_task_flow (~45 lines)
  - delete_task_flow (~40 lines)
- **src/main.py**: Modify 2 sections (~5 lines)
  - Import statement (add 3 function names)
  - Menu dispatch (replace placeholder for options 3, 4, 5)

### Testing Strategy

- Manual testing per constitution (automated tests deferred to Phase II)
- Use quickstart.md comprehensive testing checklist (50+ scenarios)
- Each story has independent test criteria for validation
- Integration tests verify stories work together

### Quality Standards

- All functions require Python type hints and Google-style docstrings
- Error messages use ❌ prefix, success messages use ✓ prefix
- PEP 8 compliance required (4-space indent, <79 char lines)
- Functions stay under 50 lines including docstring
- Module stays under 300 lines (cli.py will be ~280 after addition)

### Commit Strategy

Recommended commit points:
1. After Phase 2 verification complete
2. After User Story 1 complete (T004-T011) - "feat: implement toggle task completion"
3. After User Story 2 complete (T012-T024) - "feat: implement update task details"
4. After User Story 3 complete (T025-T034) - "feat: implement delete task with confirmation"
5. After Phase 6 complete (T035-T043) - "test: complete integration testing for task operations"

---

## Reference Materials

- **Implementation Guide**: specs/003-task-operations/quickstart.md (complete function implementations)
- **Design Decisions**: specs/003-task-operations/plan.md (research and rationale)
- **Data Model**: specs/003-task-operations/data-model.md (entity analysis and state transitions)
- **Requirements**: specs/003-task-operations/spec.md (23 functional requirements with acceptance criteria)
- **Constitution**: .specify/memory/constitution.md (code quality standards and principles)

---

## Success Criteria

Feature is complete when:
- ✅ All three flow functions implemented with type hints and docstrings
- ✅ All three menu options (3, 4, 5) wired correctly
- ✅ All manual tests pass from quickstart.md checklist
- ✅ Integration tests verify stories work independently and together
- ✅ Code quality verification passes (PEP 8, error messages, documentation)
- ✅ All 23 functional requirements from spec.md are satisfied
- ✅ Constitution compliance maintained (no violations)

**Ready for `/sp.implement` or manual implementation following task order!**
