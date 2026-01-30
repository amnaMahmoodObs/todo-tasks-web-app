# Todo Console App - Phase 1

> **Part of the "Evolution of Todo" Hackathon Project**
> This is Phase 1 of a multi-phase hackathon demonstrating progressive enhancement from console to cloud.

An in-memory command-line todo application built using spec-driven development with Claude Code and Spec-Kit Plus.

## 🎯 Features

- ✅ Add new tasks with title and description
- ✅ View all tasks with status indicators
- ✅ Update existing task details
- ✅ Delete tasks by ID
- ✅ Mark tasks as complete/incomplete

## 🛠️ Technology Stack

- Python 3.13+
- UV (Package Manager)
- Claude Code (AI Code Generation)
- Spec-Kit Plus (Spec-Driven Development)

## 📋 Prerequisites

- WSL2 Ubuntu (for Windows users)
- Python 3.13+
- UV package manager
- Claude Code CLI

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd todo-console-app  # This is the Phase 1 folder
```

### 2. Install dependencies
```bash
uv sync
```

### 3. Run the application
```bash
uv run src/main.py
```

## 📖 Usage

### Starting the App
```bash
uv run src/main.py
```

### Menu Options
```
=== Todo Console App ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete/Incomplete
6. Exit

Choose an option (1-6):
```

### Examples

#### Add a Task
```
Choose option: 1
Enter title: Buy groceries
Enter description: Milk, eggs, bread
✓ Task added successfully! (ID: 1)
```

#### View Tasks
```
Choose option: 2
=== Your Tasks ===
[1] ☐ Buy groceries
    Milk, eggs, bread
[2] ☑ Call dentist
    Schedule appointment
```

#### Update a Task
```
Choose option: 3
Enter task ID: 1
Enter new title (or press Enter to skip): Buy groceries and snacks
Enter new description (or press Enter to skip): 
✓ Task updated successfully!
```

#### Delete a Task
```
Choose option: 4
Enter task ID: 2
✓ Task deleted successfully!
```

#### Mark Complete
```
Choose option: 5
Enter task ID: 1
✓ Task marked as complete!
```

## 📁 Project Structure
```
todo-console-app/
├── CONSTITUTION.md          # Project principles and standards
├── README.md               # This file
├── CLAUDE.md              # Claude Code instructions
├── specs/                 # All specification files
│   ├── 00-project-setup.md
│   ├── 01-add-task.md
│   ├── 02-view-tasks.md
│   ├── 03-update-task.md
│   ├── 04-delete-task.md
│   └── 05-mark-complete.md
├── src/                   # Source code
│   ├── main.py           # Entry point
│   ├── cli.py            # CLI interface
│   ├── todo.py           # Todo logic
│   └── storage.py        # In-memory storage
└── tests/                # Tests
    └── test_todo.py
```

## 🧪 Testing

Manual testing checklist:
- [ ] Add multiple tasks
- [ ] View empty task list
- [ ] View populated task list
- [ ] Update task with valid ID
- [ ] Update task with invalid ID
- [ ] Delete task with valid ID
- [ ] Delete task with invalid ID
- [ ] Mark task as complete
- [ ] Mark completed task as incomplete
- [ ] Handle empty title input
- [ ] Exit application gracefully

## 🤝 Development Approach

This project follows **Spec-Driven Development**:
1. Write detailed specification in `/specs`
2. Use Claude Code to generate implementation
3. Test the generated code
4. Refine spec if needed (NOT the code)
5. Regenerate until correct

See `CLAUDE.md` for detailed instructions.

## 📝 Phase I Requirements

- [x] Implement 5 basic features
- [x] Use spec-driven development
- [x] Clean code principles
- [x] Proper project structure
- [x] GitHub repository with all files
- [x] Working console application

## 🎓 Hackathon Context

This is Phase 1 of the "Evolution of Todo" hackathon project. Each phase builds upon the previous, demonstrating progressive enhancement and modern development practices.

### Project Phases
- **Phase 1:** In-memory Python console app ✅ (Current)
- **Phase 2:** Full-stack web application (Planned)
- **Phase 3:** AI-powered chatbot (Planned)
- **Phase 4:** Local Kubernetes deployment (Planned)
- **Phase 5:** Cloud deployment (Planned)

### Repository Structure
```
hackathon-todo-project/          # Root monorepo
├── .gitignore                   # Shared for all phases
├── README.md                    # Overview of all phases
├── phase-1-console-app/         # ← You are here
│   ├── README.md               # This file
│   ├── src/
│   ├── specs/
│   └── ...
└── phase-2-web-app/            # (Future)
    └── ...
```

## 👤 Author

Amna Mahmood  
[Your Email/GitHub]

## 📄 License

[Your License]

---

**Built with ❤️ using AI-driven development**
