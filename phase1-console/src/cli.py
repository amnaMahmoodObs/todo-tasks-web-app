




"""CLI interface functions for todo console application.

This module provides terminal UI functions for menu display, input collection,
and screen management.
"""

import os
import platform


def display_menu() -> None:
    """Display the main menu with numbered options.

    Prints a formatted menu header and six numbered options for user selection.
    """
    print("=== Todo App Menu ===")
    print()
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Complete")
    print("6. Exit")
    print()


def get_user_choice() -> int:
    """Get and validate user menu choice.

    Prompts user for input and validates it's an integer between 1-6.
    Loops until valid input is received, showing friendly error messages
    for invalid inputs.

    Returns:
        Integer choice between 1 and 6.

    Note:
        Never raises exceptions - handles all errors internally with
        user-friendly messages.
    """
    while True:
        try:
            choice_str = input("Enter your choice (1-6): ")
            choice = int(choice_str)

            if 1 <= choice <= 6:
                return choice
            else:
                print("Error: Choice must be between 1 and 6. "
                      "Please try again.")
        except ValueError:
            print("Error: Invalid input. "
                  "Please enter a number between 1 and 6.")


def clear_screen() -> None:
    """Clear the terminal screen.

    Detects the operating system and uses the appropriate clear command:
    - Windows: 'cls'
    - macOS/Linux: 'clear'
    """
    system = platform.system()
    if system == "Windows":
        os.system('cls')
    else:
        os.system('clear')
