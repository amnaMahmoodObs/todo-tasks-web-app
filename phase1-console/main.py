"""Todo console application entry point.

This module provides the main application loop and orchestrates the CLI
interaction with storage and user interface components.
"""

from src.storage import TodoStorage
from src.cli import (
    display_menu,
    get_user_choice,
    clear_screen,
    add_task_flow,
    view_tasks_flow
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
        elif choice == 6:
            print("\nThank you for using Todo App. Goodbye!")
            break
        elif choice in [3, 4, 5]:
            print("\n⚠️  Feature not yet implemented")
            input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()
