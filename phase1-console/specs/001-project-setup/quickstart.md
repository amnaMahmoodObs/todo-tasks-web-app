# Quickstart Guide: Todo Console Application

**Feature**: 001-project-setup (Foundation)
**Created**: 2026-01-22
**Phase**: I (In-Memory CLI)

## Prerequisites

- **Python**: Version 3.13 or higher
- **UV Package Manager**: Installed and available in PATH
- **Terminal/Console**: Any terminal emulator (Terminal.app, iTerm2, Windows Terminal, etc.)
- **Operating System**: macOS, Linux, or Windows

### Check Prerequisites

```bash
# Check Python version (must be 3.13+)
python --version
# or
python3 --version

# Check UV installation
uv --version

# Check terminal access
echo "Terminal works!"
```

---

## Installation

### Step 1: Navigate to Project Directory

```bash
cd /path/to/todo-console-app
```

### Step 2: Verify Project Structure

After implementation, your project should have:

```
todo-console-app/
├── src/
│   ├── main.py      # Application entry point
│   ├── cli.py       # UI functions
│   ├── todo.py      # Todo class
│   └── storage.py   # TodoStorage class
├── specs/
│   └── 001-project-setup/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       └── quickstart.md  # This file
└── pyproject.toml
```

---

## Running the Application

### Basic Usage

```bash
# From project root
uv run src/main.py
```

**Expected Output**:
```
=== Todo App Menu ===

1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Complete
6. Exit

Enter your choice (1-6):
```

---

## User Guide

### Menu Navigation

The application presents 6 menu options:

| Option | Feature | Status (Phase I) |
|--------|---------|------------------|
| 1 | Add Task | Not implemented (placeholder) |
| 2 | View Tasks | Not implemented (placeholder) |
| 3 | Update Task | Not implemented (placeholder) |
| 4 | Delete Task | Not implemented (placeholder) |
| 5 | Mark Complete | Not implemented (placeholder) |
| 6 | Exit | ✅ Fully functional |

### Basic Workflow (Phase I)

1. **Start Application**:
   ```bash
   uv run src/main.py
   ```

2. **Navigate Menu**:
   - Type a number (1-6) and press Enter
   - Invalid input shows friendly error message

3. **Test Options 1-5**:
   - Selecting any of these shows: "⚠️ Feature not yet implemented"
   - Press Enter to return to menu

4. **Exit Application**:
   - Select option 6
   - Application displays: "Thank you for using Todo App. Goodbye!"
   - Application exits cleanly

### Example Session

```
$ uv run src/main.py

=== Todo App Menu ===

1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Complete
6. Exit

Enter your choice (1-6): 1

⚠️  Feature not yet implemented

Press Enter to continue...

[Screen clears and menu redisplays]

Enter your choice (1-6): abc
Error: Invalid input. Please enter a number between 1 and 6.

Enter your choice (1-6): 9
Error: Choice must be between 1 and 6. Please try again.

Enter your choice (1-6): 6

Thank you for using Todo App. Goodbye!
$
```

---

## Acceptance Testing

### Test Scenario 1: Application Startup

**Given**: Application is not running
**When**: User runs `uv run src/main.py`
**Then**: Menu displays within 1 second with 6 options

**Verification**: ✅ Menu appears, application ready for input

---

### Test Scenario 2: Menu Option Selection

**Given**: Menu is displayed
**When**: User enters valid number (1-6) and presses Enter
**Then**: System responds appropriately (placeholder or exit)

**Verification**: ✅ Options 1-5 show "not implemented", option 6 exits

---

### Test Scenario 3: Invalid Input Handling

**Given**: Menu is displayed
**When**: User enters invalid input (non-number, empty, out of range)
**Then**: Friendly error message displays, menu redisplays

**Test Cases**:
```
Input: "" (empty) → "Error: Invalid input. Please enter a number between 1 and 6."
Input: "abc" → "Error: Invalid input. Please enter a number between 1 and 6."
Input: "3.14" → "Error: Invalid input. Please enter a number between 1 and 6."
Input: "0" → "Error: Choice must be between 1 and 6. Please try again."
Input: "7" → "Error: Choice must be between 1 and 6. Please try again."
Input: "-1" → "Error: Choice must be between 1 and 6. Please try again."
```

**Verification**: ✅ All invalid inputs handled gracefully, no crashes

---

### Test Scenario 4: Clean Exit

**Given**: User is at menu
**When**: User selects option 6
**Then**: Goodbye message displays, application exits within 1 second

**Verification**: ✅ Clean exit, no errors, terminal prompt returns

---

### Test Scenario 5: No Stack Traces

**Given**: Any error occurs (invalid input, etc.)
**When**: Error is displayed to user
**Then**: Only friendly message shown, no Python stack traces

**Verification**: ✅ No "Traceback", "ValueError", or exception details shown

---

### Test Scenario 6: Rapid Operations

**Given**: Application is running
**When**: User rapidly selects options (1, 2, 3, 4, 5, 6) in sequence
**Then**: Each option responds correctly, no lag or errors

**Verification**: ✅ Handles consecutive operations smoothly

---

## Troubleshooting

### Issue: "command not found: uv"

**Solution**: Install UV package manager
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or via pip
pip install uv
```

---

### Issue: "Python 3.13 not found"

**Solution**: Install Python 3.13+
```bash
# macOS (Homebrew)
brew install python@3.13

# Ubuntu/Debian
sudo apt update
sudo apt install python3.13

# Check installation
python3.13 --version
```

---

### Issue: "ModuleNotFoundError: No module named 'src'"

**Cause**: Running from wrong directory

**Solution**: Ensure you're in project root
```bash
pwd  # Should show /path/to/todo-console-app
ls src/  # Should show main.py, cli.py, todo.py, storage.py
uv run src/main.py
```

---

### Issue: Clear screen not working

**Cause**: OS detection or permission issue

**Symptoms**: Screen doesn't clear between menu displays

**Solution**: This is cosmetic only, app still functions. Clear manually with Ctrl+L (macOS/Linux) or `cls` (Windows)

---

### Issue: Unicode checkbox symbols not displaying

**Cause**: Terminal font doesn't support Unicode

**Symptoms**: ☐ and ☑ appear as � or boxes

**Solution**:
1. Change terminal font to one with Unicode support (e.g., Menlo, Consolas, DejaVu Sans Mono)
2. Or use terminal with good Unicode support (iTerm2, Windows Terminal, modern GNOME Terminal)

---

## Performance Benchmarks

| Metric | Target | Expected |
|--------|--------|----------|
| Startup time | <1 second | ~100-300ms |
| Menu display | Instant | <50ms |
| Exit time | <1 second | ~50-100ms |
| Memory usage | Minimal | <10MB |
| Consecutive operations | 1000+ | No degradation |

---

## Known Limitations (Phase I)

- **No Data Persistence**: All data lost on exit (in-memory only)
- **Single User**: No multi-user support
- **No CRUD Features**: Options 1-5 show placeholder messages
- **No Automated Tests**: Manual testing only
- **No Input History**: No arrow key navigation of previous inputs
- **No Configuration**: No settings or preferences
- **Terminal Only**: No GUI

---

## Next Steps

After verifying this foundation works:

1. **Proceed to Features**: Implement CRUD operations (Add, View, Update, Delete, Mark Complete)
2. **Run `/sp.tasks`**: Generate task breakdown for implementation
3. **Implement via Claude Code**: Execute tasks to build features
4. **Test Manually**: Verify each CRUD operation works
5. **Iterate**: Refine specs if issues found

---

## Support

- **Specification**: See `spec.md` for requirements
- **Implementation Plan**: See `plan.md` for technical design
- **Data Model**: See `data-model.md` for entity details
- **Constitution**: See `.specify/memory/constitution.md` for project principles

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial Phase I foundation quickstart |
