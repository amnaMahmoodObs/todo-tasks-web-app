# Feature Specification: Task Operations (Update, Delete, Toggle Complete)

**Feature Branch**: `003-task-operations`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "Implement update, delete, and toggle complete features. Update Task: create update_task_flow(storage) that prompts for task ID with validation, retrieves task via storage.get(), shows "❌ Task #[ID] not found" if doesn't exist, displays current task details, prompts for new title (press Enter to skip, validates non-empty if provided), prompts for new description (Enter to skip), calls storage.update() only for provided fields, shows "✓ Task updated!" with new details. Delete Task: create delete_task_flow(storage) that prompts for ID with validation, retrieves and displays task, asks "Delete this task? (y/n): " for confirmation, if 'y' calls storage.delete() and shows "✓ Task deleted!", if 'n' shows "❌ Deletion cancelled", handles invalid confirmation input. Toggle Complete: create toggle_complete_flow(storage) that prompts for ID, retrieves task, toggles completed boolean, calls storage.update(id, completed=new_value), shows "✓ Task marked as complete!" or "✓ Task marked as incomplete!" with status icon. Update main.py options 3, 4, 5 to call respective flows. All need ID validation with try-except ValueError, existence checking, type hints, docstrings. Test: can update any field, delete with confirmation, toggle status, all errors handled gracefully."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Task Completion Status (Priority: P1)

A user has completed a task and wants to mark it as complete, or wants to reopen a completed task for additional work.

**Why this priority**: This is the most common task operation - users frequently complete tasks as they work. This provides immediate value as a standalone feature and is the simplest to implement and test.

**Independent Test**: Can be fully tested by creating a task, marking it complete, verifying the status change, then toggling it back to incomplete. Delivers immediate value without requiring any other operations.

**Acceptance Scenarios**:

1. **Given** I have an incomplete task with ID 1, **When** I select "Toggle Complete" and enter ID 1, **Then** the task is marked as complete and I see "✓ Task marked as complete!" with a completion status icon
2. **Given** I have a completed task with ID 2, **When** I select "Toggle Complete" and enter ID 2, **Then** the task is marked as incomplete and I see "✓ Task marked as incomplete!" with an incomplete status icon
3. **Given** I enter an invalid task ID (non-existent), **When** I attempt to toggle, **Then** I see "❌ Task #[ID] not found" and can return to the main menu
4. **Given** I enter a non-numeric ID, **When** I attempt to toggle, **Then** I see an error message about invalid input format and can retry or return to the main menu

---

### User Story 2 - Update Task Details (Priority: P2)

A user realizes a task's title or description needs changes after creation - perhaps to clarify requirements, fix typos, or add more detail.

**Why this priority**: Editing is a fundamental CRUD operation that provides flexibility for users. It's more complex than toggle but more commonly needed than deletion. Can be tested independently without delete functionality.

**Independent Test**: Can be fully tested by creating a task, updating its title and/or description, and verifying the changes persist. Works independently of delete and toggle operations.

**Acceptance Scenarios**:

1. **Given** I have a task with ID 3 titled "Old Title", **When** I select "Update Task", enter ID 3, and provide a new title "New Title" (pressing Enter for description), **Then** the task's title is updated and I see "✓ Task updated!" with the new details
2. **Given** I have a task with ID 4, **When** I select "Update Task", enter ID 4, press Enter to skip title, and provide a new description, **Then** only the description is updated and the title remains unchanged
3. **Given** I have a task with ID 5, **When** I select "Update Task", enter ID 5, and press Enter for both title and description, **Then** I see a message indicating no changes were made
4. **Given** I attempt to update a task, **When** I provide an empty string for the title (not just Enter), **Then** I see a validation error requiring non-empty title and can retry
5. **Given** I enter an invalid task ID, **When** I attempt to update, **Then** I see "❌ Task #[ID] not found" and return to the main menu

---

### User Story 3 - Delete Task (Priority: P3)

A user wants to permanently remove a task that is no longer relevant, was created by mistake, or has been superseded by another task.

**Why this priority**: Deletion is less frequently needed than completion or editing. It requires confirmation to prevent accidental data loss, making it slightly more complex. Users can work effectively without deletion in the short term.

**Independent Test**: Can be fully tested by creating a task, deleting it with confirmation, and verifying it no longer appears in the task list. Works independently of update and toggle operations.

**Acceptance Scenarios**:

1. **Given** I have a task with ID 6, **When** I select "Delete Task", enter ID 6, and confirm with 'y', **Then** the task is permanently removed and I see "✓ Task deleted!"
2. **Given** I have a task with ID 7, **When** I select "Delete Task", enter ID 7, and respond 'n' to the confirmation, **Then** the task is NOT deleted and I see "❌ Deletion cancelled"
3. **Given** I am deleting a task, **When** I enter an invalid confirmation response (neither 'y' nor 'n'), **Then** I see an error message and am prompted again for a valid confirmation
4. **Given** I enter an invalid task ID, **When** I attempt to delete, **Then** I see "❌ Task #[ID] not found" before any confirmation prompt
5. **Given** I am prompted for task ID, **When** I enter a non-numeric value, **Then** I see an error about invalid input format and can retry or return to the main menu

---

### Edge Cases

- What happens when a user enters an extremely long title or description during update (e.g., 10,000 characters)?
- How does the system handle concurrent operations if storage is accessed by multiple flows simultaneously?
- What happens when storage.get() returns None versus raising an exception?
- How are negative task IDs handled during validation?
- What happens when a user enters whitespace-only strings for title (e.g., "   ")?
- How does the system behave if the storage backend is temporarily unavailable during an operation?
- What happens when attempting to toggle/update/delete a task immediately after another operation modified it?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate task ID input as a positive integer for all operations (update, delete, toggle)
- **FR-002**: System MUST handle ValueError exceptions when parsing non-numeric task IDs and display user-friendly error messages
- **FR-003**: System MUST check task existence using storage.get() before performing any operation
- **FR-004**: System MUST display "❌ Task #[ID] not found" when a task ID does not exist in storage
- **FR-005**: System MUST allow users to skip title updates by pressing Enter without input
- **FR-006**: System MUST allow users to skip description updates by pressing Enter without input
- **FR-007**: System MUST validate that new titles are non-empty when provided (not skipped)
- **FR-008**: System MUST reject whitespace-only titles with appropriate error message
- **FR-009**: System MUST call storage.update() only with fields that were actually changed by the user
- **FR-010**: System MUST display current task details before prompting for updates
- **FR-011**: System MUST display "✓ Task updated!" message along with new task details after successful update
- **FR-012**: System MUST require explicit confirmation (y/n) before deleting a task
- **FR-013**: System MUST validate confirmation input and re-prompt on invalid responses (not 'y' or 'n')
- **FR-014**: System MUST display task details before prompting for deletion confirmation
- **FR-015**: System MUST call storage.delete() only after receiving 'y' confirmation
- **FR-016**: System MUST display "✓ Task deleted!" after successful deletion
- **FR-017**: System MUST display "❌ Deletion cancelled" when user responds 'n' to confirmation
- **FR-018**: System MUST toggle the completed boolean value for toggle operations (True↔False)
- **FR-019**: System MUST display "✓ Task marked as complete!" with status icon when task becomes completed
- **FR-020**: System MUST display "✓ Task marked as incomplete!" with status icon when task becomes incomplete
- **FR-021**: All flow functions MUST include Python type hints for parameters and return values
- **FR-022**: All flow functions MUST include docstrings describing purpose, parameters, and behavior
- **FR-023**: System MUST connect main.py menu options 3, 4, and 5 to update_task_flow, delete_task_flow, and toggle_complete_flow respectively

### Key Entities

- **Task**: Represents a to-do item with attributes including:
  - id: Unique positive integer identifier
  - title: Non-empty string describing the task
  - description: Optional string with additional task details
  - completed: Boolean status indicating whether task is complete
  - Other attributes (created_at, etc.) that may exist from previous features

- **Storage**: Abstraction for task persistence providing:
  - get(id): Retrieves task by ID or returns None if not found
  - update(id, **fields): Updates specified task fields
  - delete(id): Removes task from storage

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle any task's completion status in under 10 seconds with at most 2 inputs (menu selection + ID)
- **SC-002**: Users can update any task field (title or description) in under 30 seconds
- **SC-003**: System prevents accidental deletion by requiring explicit confirmation, reducing unintended deletions to near-zero
- **SC-004**: All error conditions (invalid ID format, non-existent task, invalid confirmation) display clear, actionable error messages
- **SC-005**: 100% of ID validation errors are caught and handled gracefully without application crashes
- **SC-006**: Users can successfully complete all three operations (update, delete, toggle) in a single session without errors
- **SC-007**: Task state changes (completion status, title, description, existence) persist correctly after operations complete
- **SC-008**: Users understand operation outcomes through clear success/failure messages without consulting documentation

## Assumptions

- The TodoStorage class already exists with get(), update(), and delete() methods as specified
- The storage.get() method returns None when a task is not found (rather than raising an exception)
- The storage.update() method accepts keyword arguments for the fields to update
- Main.py already has a menu structure with placeholder options 3, 4, and 5 for these operations
- Task IDs are positive integers managed by the storage layer
- The CLI interface uses standard input() for user interaction
- Console supports basic Unicode characters for status icons (✓, ❌)
- Single-user environment (no concurrent access concerns for MVP)

## Out of Scope

- Batch operations (updating/deleting multiple tasks at once)
- Undo functionality for delete operations
- Task history or audit trail of changes
- Advanced search/filter before selecting task to modify
- Bulk import/export of tasks
- Task archiving (soft delete) as alternative to hard delete
- Keyboard shortcuts or command aliases
- Internationalization of messages
- Task validation rules beyond non-empty title
- Automated testing framework (manual testing sufficient for MVP)

## Dependencies

- Existing TodoStorage class with required methods (get, update, delete)
- Existing Task model/structure with id, title, description, and completed attributes
- Existing main.py menu framework
- Python standard library for input/output operations
