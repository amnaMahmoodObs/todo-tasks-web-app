"""Todo console application entry point.

This module provides the main application loop and orchestrates the CLI
interaction with storage and user interface components.
"""

from storage import TodoStorage
from cli import (
    display_menu,
    get_user_choice,
    clear_screen,
    add_task_flow,
    view_tasks_flow,
    toggle_complete_flow,
    update_task_flow,
    delete_task_flow
)


def main() -> None:
    """Run the todo console application.

    Initializes storage, runs the main event loop for menu interaction,
    and handles user option selection. Continues until user chooses to exit.
    """
    storage = TodoStorage()

    while True:
        clear_screen()
        display_menu()
        choice = get_user_choice()

        if choice == 1:
            add_task_flow(storage)
        elif choice == 2:
            view_tasks_flow(storage)
        elif choice == 3:
            update_task_flow(storage)
        elif choice == 4:
            delete_task_flow(storage)
        elif choice == 5:
            toggle_complete_flow(storage)
        elif choice == 6:
            print("\nThank you for using Todo App. Goodbye!")
            break


if __name__ == "__main__":
    main()
