"""Todo data model for console application.

This module defines the Todo class representing a single task with metadata
for tracking and display.
"""

from datetime import datetime


class Todo:
    """Represents a single task with metadata for tracking and display.

    Attributes:
        id: Unique integer identifier (assigned by storage).
        title: Brief task description (1-100 characters, required).
        description: Detailed task information (optional).
        completed: Completion status flag (default False).
        created_at: Timestamp of todo creation (auto-set if not provided).
    """

    def __init__(
        self,
        id: int,
        title: str,
        description: str = "",
        completed: bool = False,
        created_at: datetime | None = None
    ) -> None:
        """Initialize a Todo instance.

        Args:
            id: Unique identifier for the todo.
            title: Brief title for the task (1-100 characters).
            description: Detailed description (default: empty string).
            completed: Completion status (default: False).
            created_at: Creation timestamp (default: current time).

        Raises:
            ValueError: If title is empty or exceeds 100 characters.
        """
        if not title or len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if len(title) > 100:
            raise ValueError("Title cannot exceed 100 characters")

        self.id = id
        self.title = title
        self.description = description
        self.completed = completed
        self.created_at = (created_at if created_at is not None
                           else datetime.now())

    def __str__(self) -> str:
        """Return human-readable string representation with checkbox symbol.

        Returns:
            Formatted string showing completion status, ID, and title.
            Includes description on separate line if present.

        Example:
            [☐] ID: 1 - Buy groceries
            Description: Milk, eggs, bread

            [☑] ID: 2 - Finish report
        """
        checkbox = "☑" if self.completed else "☐"
        result = f"[{checkbox}] ID: {self.id} - {self.title}"
        if self.description:
            result += f"\nDescription: {self.description}"
        return result

    def __repr__(self) -> str:
        """Return debug representation showing all attributes.

        Returns:
            String representation suitable for debugging.

        Example:
            Todo(id=1, title='Buy groceries', description='Milk, eggs, bread',
                 completed=False, created_at=2026-01-22 14:30:00)
        """
        return (
            f"Todo(id={self.id}, title='{self.title}', "
            f"description='{self.description}', completed={self.completed}, "
            f"created_at={self.created_at})"
        )
