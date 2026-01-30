# Implementation Plan: Add and View Tasks

**Branch**: `002-add-view-tasks` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-add-view-tasks/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements the first two CRUD operations for the Todo Console Application: **Add Task** and **View Tasks**. Users will be able to create new todo items with title validation and optional descriptions, then view all their tasks in a formatted list with completion status indicators. The implementation extends existing CLI flows in `cli.py` and integrates with the foundation classes `Todo` and `TodoStorage` established in Phase I.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Python standard library only (no external packages)
**Storage**: In-memory dictionary-based storage via `TodoStorage` class
**Testing**: Manual testing (automated tests deferred to Phase II per constitution)
**Target Platform**: macOS/Linux/Windows console (cross-platform terminal application)
**Project Type**: Single project (console application with modular structure)
**Performance Goals**: Interactive response time (<100ms for add/view operations with up to 1000 tasks)
**Constraints**: Standard library only; <200ms user-perceived latency; supports up to 1000 tasks without degradation
**Scale/Scope**: Phase I scope - 5 CRUD operations, ~300 total LOC across 4 modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Spec-Driven Development** | ✅ PASS | All code generated from spec.md via Claude Code. No manual edits. |
| **II. Claude Code as Primary Tool** | ✅ PASS | Using Claude Code for all implementation tasks. |
| **III. Clean Architecture** | ✅ PASS | Changes confined to `cli.py` (UI logic) and `main.py` (menu wiring). Core modules `todo.py` and `storage.py` already exist and are used without modification. |
| **IV. Type Safety and Documentation** | ✅ PASS | All new functions will include type hints and Google-style docstrings. |
| **V. Robust Error Handling** | ✅ PASS | Title validation with friendly error messages. Input loops prevent crashes. Empty state handling. |
| **VI. Standard Library Only** | ✅ PASS | No external dependencies required. Using only built-in `input()`, `print()`, and existing classes. |
| **VII. Hackathon Evolution Readiness** | ✅ PASS | UI logic in `cli.py` cleanly separated from storage/models. Future phases can swap storage implementation without touching UI flows. |

**Constitution Gate**: ✅ **PASSED** - All principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── todo.py          # Todo class (data model) - NO CHANGES
├── storage.py       # TodoStorage class (in-memory repository) - NO CHANGES
├── cli.py           # CLI interface functions - ADD: add_task_flow(), view_tasks_flow()
└── main.py          # Application entry point - UPDATE: wire menu options 1 & 2

main.py              # Symlink/duplicate at root for easy launch - UPDATE: wire menu options 1 & 2

tests/               # Manual testing only in Phase I (automated tests in Phase II)
```

**Structure Decision**: Single project structure. This feature adds two new flow functions to `cli.py` (`add_task_flow()` and `view_tasks_flow()`) and updates `main.py` to wire menu options 1 and 2 to call these flows. The existing foundation classes (`Todo`, `TodoStorage`) and existing CLI utilities (`display_menu()`, `get_user_choice()`, `clear_screen()`) remain unchanged.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations to report.** All constitutional principles satisfied.

## Post-Design Constitution Re-evaluation

*Performed after Phase 1 design completion.*

| Principle | Status | Design Review Notes |
|-----------|--------|---------------------|
| **I. Spec-Driven Development** | ✅ PASS | Design artifacts generated from spec. Implementation will follow contracts. |
| **II. Claude Code as Primary Tool** | ✅ PASS | All implementation tasks will use Claude Code via `/sp.tasks` workflow. |
| **III. Clean Architecture** | ✅ PASS | Design preserves clean separation: UI flows in `cli.py`, orchestration in `main.py`, no changes to domain models (`todo.py`, `storage.py`). Function contracts clearly define boundaries. |
| **IV. Type Safety and Documentation** | ✅ PASS | Function contracts specify type hints and docstrings. Implementation checklist includes type annotations. |
| **V. Robust Error Handling** | ✅ PASS | Validation loops designed with friendly error messages. No exceptions exposed to users. Edge cases documented in contracts. |
| **VI. Standard Library Only** | ✅ PASS | Design uses only `input()`, `print()`, and existing classes. No external dependencies introduced. |
| **VII. Hackathon Evolution Readiness** | ✅ PASS | Flow functions accept `storage` as parameter (dependency injection pattern). Future phases can swap storage implementation without touching UI flows. Clean contracts enable independent evolution. |

**Post-Design Gate**: ✅ **PASSED** - Design maintains all constitutional principles. Ready for task generation (`/sp.tasks`).
