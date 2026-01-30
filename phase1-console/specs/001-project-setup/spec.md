# Feature Specification: Project Setup - Core Architecture and Classes

**Feature Branch**: `001-project-setup`
**Created**: 2026-01-22
**Status**: Draft
**Priority**: P1 (Foundation - blocks all other features)
**Phase**: I (In-Memory CLI)
**Constitution Version**: 1.0.0

**Input**: User description: "Create specification for project setup and foundational structure. Feature name: '00-project-setup - Core Architecture and Classes'. Requirements: (1) Create Todo class in src/todo.py with attributes: id as int, title as str, description as str, completed as bool defaulting to False, created_at as datetime. Include __init__ method with type hints, __str__ method for readable display format showing completion status with ☐/☑ symbols, and __repr__ for debugging. (2) Create TodoStorage class in src/storage.py managing in-memory dict storage keyed by task ID. Initialize with empty todos dict and next_id counter starting at 1. Methods: add(todo) returns assigned ID and increments counter, get(id) returns Todo or None, get_all() returns list of all todos sorted by ID, update(id, title=None, description=None, completed=None) updates only provided fields and returns bool success, delete(id) removes and returns bool success. (3) Create CLI helper functions in src/cli.py: display_menu() prints numbered menu 1-6, get_user_choice() gets and validates integer input 1-6 with try-except for ValueError showing friendly error, clear_screen() for better UX. (4) Create src/main.py entry point with main() function initializing TodoStorage instance and running while True loop calling display_menu and get_user_choice, handling option 6 to exit with goodbye message, options 1-5 showing '⚠️ Feature not yet implemented' placeholder. All functions require type hints, Google-style docstrings, PEP 8 compliance. Acceptance criteria: can run uv run src/main.py, menu displays, can choose options, invalid input handled gracefully, exit works cleanly, no crashes on any input."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Application Startup and Navigation (Priority: P1)

As a user, I want to start the todo application and see a clear menu of available options, so that I can understand what actions I can perform and navigate the application easily.

**Why this priority**: This is the foundational user experience - without a working menu system and application framework, no other features can be accessed or tested. This is the entry point for all user interactions.

**Independent Test**: Can be fully tested by running the application, verifying the menu displays correctly, navigating through menu options, and exiting cleanly. Delivers a working application shell ready for feature implementation.

**Acceptance Scenarios**:

1. **Given** the application is not running, **When** user runs the application, **Then** a numbered menu with 6 options displays
2. **Given** the menu is displayed, **When** user enters a valid option number (1-6), **Then** the system responds appropriately
3. **Given** the menu is displayed, **When** user enters an invalid input (non-number, out of range), **Then** a friendly error message displays and menu redisplays
4. **Given** user is at the menu, **When** user selects option 6 (Exit), **Then** a goodbye message displays and application exits cleanly
5. **Given** user selects options 1-5, **When** the option is not yet implemented, **Then** a clear "Feature not yet implemented" message displays
6. **Given** any error occurs, **When** displaying error messages, **Then** no stack traces are shown to the user

---

### User Story 2 - Data Model Foundation (Priority: P1)

As a developer (preparing for future features), I want the core Todo data structure and storage mechanism established, so that all CRUD features can be built on a consistent foundation with proper data management.

**Why this priority**: The Todo class and TodoStorage are the data backbone of the entire application. All five CRUD operations depend on these structures. Establishing them first ensures consistency across all features.

**Independent Test**: Can be tested by verifying the Todo class can be instantiated with required attributes, displays correctly, and the TodoStorage can store/retrieve todos. This delivers the complete data layer ready for CRUD operations.

**Acceptance Scenarios**:

1. **Given** a Todo is created, **When** accessing its attributes, **Then** id, title, description, completed, and created_at are available with correct types
2. **Given** a Todo is created with title only, **When** converting to string, **Then** it displays in human-readable format with completion checkbox symbol (☐ for incomplete, ☑ for complete)
3. **Given** a TodoStorage is initialized, **When** adding a new todo, **Then** a unique ID is assigned automatically starting from 1 and incrementing
4. **Given** todos are stored, **When** retrieving all todos, **Then** they are returned sorted by ID in ascending order
5. **Given** a todo exists in storage, **When** updating specific fields, **Then** only the provided fields are modified and others remain unchanged
6. **Given** storage operations are performed, **When** accessing non-existent IDs, **Then** None is returned (not an error)

---

### Edge Cases

- What happens when user enters empty string, whitespace, or special characters at menu prompt?
- What happens when user enters very long input (>100 characters) at menu prompt?
- What happens when user presses Ctrl+C or sends interrupt signal?
- How does system handle rapid repeated menu selections?
- What happens when title or description contains unicode characters or emoji?
- How does system display todos when created_at spans different dates?

## Requirements *(mandatory)*

### Functional Requirements

**Data Model Requirements:**

- **FR-001**: System MUST provide a Todo class with exactly five attributes: id (int), title (str), description (str), completed (bool), created_at (datetime)
- **FR-002**: Todo MUST default completed to False when not explicitly set
- **FR-003**: Todo MUST auto-set created_at to current timestamp when instantiated
- **FR-004**: Todo MUST provide string representation showing completion status using ☐ (unchecked) for incomplete and ☑ (checked) for complete tasks
- **FR-005**: Todo MUST provide debug representation showing all attributes for development purposes

**Storage Requirements:**

- **FR-006**: System MUST provide TodoStorage class managing in-memory dictionary storage keyed by integer task ID
- **FR-007**: TodoStorage MUST auto-assign unique sequential IDs starting from 1 when adding new todos
- **FR-008**: TodoStorage MUST provide add() method returning assigned ID after successful addition
- **FR-009**: TodoStorage MUST provide get() method returning Todo or None (never raise exception for missing ID)
- **FR-010**: TodoStorage MUST provide get_all() method returning todos sorted by ID in ascending order
- **FR-011**: TodoStorage MUST provide update() method accepting optional title, description, and completed parameters, updating only provided fields
- **FR-012**: TodoStorage MUST provide delete() method returning boolean success status
- **FR-013**: TodoStorage MUST initialize with empty storage and next_id counter at 1

**CLI Interface Requirements:**

- **FR-014**: System MUST display a numbered menu with 6 options: Add Task, View Tasks, Update Task, Delete Task, Mark Complete, Exit
- **FR-015**: System MUST validate user menu input accepting only integers 1-6
- **FR-016**: System MUST show friendly error message for invalid menu input (non-integer or out of range) without crashing
- **FR-017**: System MUST provide clear screen functionality to improve user experience between operations
- **FR-018**: System MUST display "⚠️ Feature not yet implemented" message for options 1-5
- **FR-019**: System MUST exit cleanly when option 6 is selected, displaying goodbye message

**Application Framework Requirements:**

- **FR-020**: System MUST provide main entry point that can be run via standard Python execution
- **FR-021**: Application MUST run in continuous loop until user chooses to exit
- **FR-022**: Application MUST handle all input errors gracefully without exposing stack traces
- **FR-023**: Application MUST be executable via `uv run src/main.py` command

**Code Quality Requirements:**

- **FR-024**: All functions and methods MUST include type hints for parameters and return values
- **FR-025**: All public functions and classes MUST include Google-style docstrings
- **FR-026**: All code MUST follow PEP 8 style guidelines
- **FR-027**: No function MUST exceed 25 lines (excluding docstrings)
- **FR-028**: All modules MUST use only Python 3.13+ standard library (no external dependencies)

### Key Entities

- **Todo**: Represents a single task with unique identifier, title, description, completion status, and creation timestamp. Core data structure for all task management operations.

- **TodoStorage**: Manages collection of todos in memory using dictionary storage. Provides CRUD operations interface and ensures data consistency through ID management.

- **Menu System**: Provides user interface for application navigation. Displays available options and handles user input validation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application starts successfully and displays menu within 1 second of execution
- **SC-002**: Users can navigate through all 6 menu options without any crashes or errors
- **SC-003**: 100% of invalid inputs (non-numeric, out of range, empty) display friendly error messages without stack traces
- **SC-004**: Application exits cleanly in under 1 second when exit option selected
- **SC-005**: Todo objects can be created and display formatted output showing completion status with checkbox symbols
- **SC-006**: TodoStorage successfully stores and retrieves 100+ todo items while maintaining correct ID sequencing
- **SC-007**: All update operations modify only specified fields, leaving other fields unchanged
- **SC-008**: Application handles 1000 consecutive menu operations without performance degradation or memory leaks
- **SC-009**: Code passes PEP 8 linting with zero violations
- **SC-010**: All public functions include complete docstrings and type hints enabling IDE autocomplete

## Assumptions

The following assumptions were made for unspecified details:

1. **Menu numbering**: Options numbered 1-6 (not 0-5) as this is more intuitive for non-technical users
2. **Checkbox symbols**: Using Unicode ☐ (U+2610) and ☑ (U+2611) for better visual clarity
3. **Clear screen implementation**: Will use standard terminal clear commands (OS-appropriate)
4. **Goodbye message**: Simple "Thank you for using Todo App. Goodbye!" message
5. **Error message format**: Following pattern "Error: [problem]. [suggestion]." as per constitution
6. **ID starting value**: IDs start at 1 (not 0) as task IDs are user-facing
7. **Sort order**: Ascending ID sort (oldest first) as default behavior
8. **Update behavior**: Partial updates supported (can update just title without affecting description)
9. **Delete behavior**: Delete by ID returns True if deleted, False if ID not found (no exception)
10. **Timestamp format**: Using datetime.now() for creation timestamp (timezone-naive for Phase I simplicity)

## Evolution Considerations (Phase II+)

**Phase II (File Persistence) Preparation:**
- TodoStorage interface designed to be swappable without changing Todo class
- All storage operations return consistent types (no implementation details leaked)
- ID management contained within storage layer

**Phase III (SQLite) Preparation:**
- Todo attributes align with common database column types
- created_at as datetime ready for SQL TIMESTAMP
- Update method signature supports partial updates (standard SQL pattern)

**Phase IV (REST API) Preparation:**
- Todo __str__ and __repr__ separation prepares for JSON serialization vs display formatting
- Storage methods return boolean/None patterns align with HTTP status code mapping
- Validation separation (UI vs business logic) will enable API input validation

**Phase V (Cloud/K8s) Preparation:**
- In-memory storage interface abstraction enables distributed cache replacement
- No global state in modules (storage passed as dependency)
- Clean shutdown on exit prepares for graceful pod termination
