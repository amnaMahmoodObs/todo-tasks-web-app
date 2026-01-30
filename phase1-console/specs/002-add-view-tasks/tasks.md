---
description: "Implementation tasks for Add and View Tasks feature"
---

# Tasks: Add and View Tasks

**Input**: Design documents from `/specs/002-add-view-tasks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only (automated tests deferred to Phase II per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `main.py` at repository root
- All tasks modify existing files (no new project structure needed)

---

## Phase 1: Setup (No Setup Needed)

**Purpose**: Project initialization and basic structure

**Status**: ✅ COMPLETE - Project structure and foundation classes (Todo, TodoStorage) already exist from previous phase

No setup tasks required for this feature.

---

## Phase 2: User Story 1 - Add First Task (Priority: P1) 🎯 MVP

**Goal**: Enable users to add new tasks with title validation and optional descriptions. This is the core value proposition - users can start tracking their work immediately.

**Independent Test**: Launch application, select "Add Task" (option 1), enter title "Buy groceries" and description "Milk, eggs, bread", verify success message displays "✓ Task #1 added successfully!" with task details, then verify task is stored by viewing tasks.

**Acceptance Criteria**:
- Users can add tasks with valid titles (1-100 characters)
- Empty titles show "❌ Title cannot be empty" and re-prompt
- Titles >100 characters show validation error and re-prompt
- Whitespace is stripped from titles automatically
- Descriptions are optional (can press Enter to skip)
- Success message shows task ID and formatted details
- Storage persists tasks correctly

### Implementation for User Story 1

- [X] T001 [US1] Implement add_task_flow() function in src/cli.py with title validation loop, description prompt, Todo creation, storage persistence, and success message display
- [X] T002 [US1] Update src/main.py to import add_task_flow and wire menu option 1 to call add_task_flow(storage)
- [X] T003 [US1] Update main.py (root) to import add_task_flow and wire menu option 1 to call add_task_flow(storage)
- [X] T004 [US1] Create TodoStorage instance in src/main.py before main loop and pass to flow functions
- [X] T005 [US1] Create TodoStorage instance in main.py (root) before main loop and pass to flow functions

**Checkpoint**: User Story 1 complete - users can add tasks with validation. Verify independently before proceeding to User Story 2.

**Manual Test Scenarios for US1**:
1. Add task with title and description → verify success message and task details
2. Add task with title only (skip description) → verify success message
3. Enter empty title → verify error message "❌ Title cannot be empty" and re-prompt
4. Enter title with leading/trailing spaces "  Clean room  " → verify whitespace stripped
5. Enter title with 101 characters → verify error message and re-prompt
6. Enter exactly 100 characters → verify task created successfully

---

## Phase 3: User Story 2 - View All Tasks (Priority: P2)

**Goal**: Enable users to view all their tasks in a formatted list with completion status indicators. Provides visibility into current workload.

**Independent Test**: Add 3 tasks using US1 functionality, then select "View Tasks" (option 2), verify all 3 tasks display with "[ID] ☐ Title" format and indented descriptions, verify blank lines separate tasks.

**Acceptance Criteria**:
- All tasks displayed in formatted list sorted by ID
- Format: "[ID] ☐ Title" for incomplete, "[ID] ☑ Title" for completed
- Descriptions indented on line below title (if present)
- Blank lines separate tasks for readability
- Header "=== Your Tasks ===" displayed
- User acknowledgment prompt before returning to menu

### Implementation for User Story 2

- [X] T006 [US2] Implement view_tasks_flow() function in src/cli.py with storage retrieval, task list display loop, and formatting
- [X] T007 [US2] Update src/main.py to import view_tasks_flow and wire menu option 2 to call view_tasks_flow(storage)
- [X] T008 [US2] Update main.py (root) to import view_tasks_flow and wire menu option 2 to call view_tasks_flow(storage)

**Checkpoint**: User Story 2 complete - users can view all tasks. Verify independently.

**Manual Test Scenarios for US2**:
1. Add 3 tasks, then view → verify all 3 displayed with correct format
2. View tasks with mixed completion states → verify ☐ and ☑ symbols correct
3. View task with multi-line description → verify indentation and readability

---

## Phase 4: User Story 3 - View Empty Task List (Priority: P3)

**Goal**: Show helpful empty state message to new users when no tasks exist. Improves onboarding experience.

**Independent Test**: Launch fresh application with no tasks, select "View Tasks" (option 2), verify message "📝 No tasks yet! Add your first task." with guidance to use option 1.

**Acceptance Criteria**:
- Empty state message displayed when storage has no tasks
- Message includes emoji "📝" and helpful guidance
- Encourages user to select option 1 to add first task
- User acknowledgment prompt before returning to menu

### Implementation for User Story 3

**Note**: This user story is implemented within the view_tasks_flow() function created in Phase 3 (T006). It's not a separate implementation but rather part of the conditional logic in view_tasks_flow().

- [X] T009 [US3] Add empty state check and message display in view_tasks_flow() in src/cli.py (if not tasks: print empty state)

**Checkpoint**: User Story 3 complete - empty state handling works. Full feature now complete!

**Manual Test Scenarios for US3**:
1. Launch app with no tasks, select "View Tasks" → verify empty state message
2. Verify message includes "📝 No tasks yet! Add your first task."
3. Verify helpful guidance to select option 1

---

## Phase 5: Polish & Validation

**Purpose**: Final validation and code quality checks

- [X] T010 Run flake8 linting on src/ directory to verify PEP 8 compliance
- [X] T011 Verify all functions have type hints and Google-style docstrings
- [X] T012 Run complete manual test suite covering all acceptance scenarios from spec.md
- [X] T013 Verify quickstart.md test scenarios all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete - no setup needed
- **User Story 1 (Phase 2)**: Can start immediately - MVP candidate
- **User Story 2 (Phase 3)**: Depends on US1 being testable (need tasks to view)
- **User Story 3 (Phase 4)**: Part of US2 implementation (no separate dependency)
- **Polish (Phase 5)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - can start immediately
- **User Story 2 (P2)**: Requires US1 to be testable (need ability to add tasks first)
- **User Story 3 (P3)**: Implemented as part of US2 (conditional branch in view_tasks_flow)

### Task Dependencies Within User Stories

**User Story 1 (Add Task)**:
- T001 must complete first (implements add_task_flow function)
- T002, T003 depend on T001 (can't import function that doesn't exist)
- T004, T005 depend on T002, T003 (menu wiring must be in place)
- T002 and T003 can run in parallel (different files)
- T004 and T005 can run in parallel (different files)

**User Story 2 (View Tasks)**:
- T006 must complete first (implements view_tasks_flow function)
- T007, T008 depend on T006 (can't import function that doesn't exist)
- T007 and T008 can run in parallel (different files)

**User Story 3 (Empty State)**:
- T009 modifies T006 implementation (must happen after T006 or during T006)

### Parallel Opportunities

**Limited parallelization for this feature due to sequential dependencies:**

- T002 and T003 can run in parallel (both wire menu option 1, different files)
- T004 and T005 can run in parallel (both create storage instance, different files)
- T007 and T008 can run in parallel (both wire menu option 2, different files)

**However**, most tasks are sequential because they modify the same file (src/cli.py) or depend on previous implementations.

**Recommendation**: Execute tasks in order T001 → T002+T003 (parallel) → T004+T005 (parallel) → T006 → T007+T008 (parallel) → T009 → T010-T013 (validation)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T005 (User Story 1)
2. **STOP and VALIDATE**: Test User Story 1 independently using manual test scenarios
3. Users can now add tasks - core value delivered!

### Incremental Delivery

1. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
2. Add User Story 2 (T006-T008) → Test independently → Users can now add AND view tasks
3. Add User Story 3 (T009) → Test independently → Complete feature with polish
4. Run final validation (T010-T013) → Production ready

### Single Developer Strategy (Recommended)

Execute tasks in strict order with validation checkpoints:

1. **T001**: Implement add_task_flow() - VALIDATE: Function exists and has correct signature
2. **T002 + T003**: Wire menu option 1 (parallel) - VALIDATE: Imports work, no syntax errors
3. **T004 + T005**: Create storage instances (parallel) - VALIDATE: App runs, option 1 works
4. **CHECKPOINT**: Full manual test of User Story 1 - VALIDATE: All US1 scenarios pass
5. **T006**: Implement view_tasks_flow() - VALIDATE: Function exists and has correct signature
6. **T007 + T008**: Wire menu option 2 (parallel) - VALIDATE: Imports work, no syntax errors
7. **CHECKPOINT**: Full manual test of User Story 2 - VALIDATE: All US2 scenarios pass
8. **T009**: Add empty state handling - VALIDATE: Empty state message displays
9. **CHECKPOINT**: Full manual test of User Story 3 - VALIDATE: All US3 scenarios pass
10. **T010-T013**: Final validation and polish - VALIDATE: All checks pass

---

## Notes

- [P] marker indicates parallelizable tasks (different files, no dependencies)
- [Story] label (US1, US2, US3) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing only (automated tests deferred to Phase II per constitution)
- Commit after each task or checkpoint
- src/main.py and main.py (root) should be kept in sync (or symlinked)
- Existing Todo and TodoStorage classes remain unchanged (no modifications needed)
- All new code goes in src/cli.py (flow functions) and main.py files (menu wiring)

---

## Task Summary

- **Total Tasks**: 13 tasks
- **User Story 1**: 5 tasks (T001-T005)
- **User Story 2**: 3 tasks (T006-T008)
- **User Story 3**: 1 task (T009)
- **Polish/Validation**: 4 tasks (T010-T013)
- **Parallel Opportunities**: 3 pairs (T002+T003, T004+T005, T007+T008)
- **Estimated Completion**: ~2-3 hours for single developer (including manual testing)

---

## Success Criteria Verification

After all tasks complete, verify these success criteria from spec.md:

- **SC-001**: Users can add a new task in under 30 seconds from menu selection to confirmation ✓
- **SC-002**: Users can view their entire task list in under 5 seconds from menu selection ✓
- **SC-003**: 100% of empty title submissions are caught and the user is re-prompted without losing context ✓
- **SC-004**: The system handles at least 1000 tasks without performance degradation in the view operation ✓
- **SC-005**: New users see the empty state message and understand how to add their first task without external help ✓
- **SC-006**: All task data entered is preserved accurately with no data loss (titles and descriptions match user input after whitespace normalization) ✓
