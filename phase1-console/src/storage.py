"""Todo storage management for in-memory persistence.

This module provides the TodoStorage class for managing a collection of todos
in memory using dictionary storage.
"""

from todo import Todo


class TodoStorage:
    """Repository interface for managing Todo collection in memory.

    This class provides CRUD operations for todos with automatic ID assignment
    and in-memory dictionary storage.

    Attributes:
        _todos: Internal dictionary storing todos keyed by ID.
        _next_id: Counter for assigning unique sequential IDs.
    """

    def __init__(self) -> None:
        """Initialize empty storage with ID counter starting at 1."""
        self._todos: dict[int, Todo] = {}
        self._next_id: int = 1

    def add(self, todo: Todo) -> int:
        """Add a todo to storage and assign unique ID.

        Args:
            todo: Todo instance to add to storage.

        Returns:
            Assigned integer ID for the todo.

        Note:
            The todo's id attribute will be modified to the assigned ID.
        """
        todo.id = self._next_id
        self._todos[todo.id] = todo
        self._next_id += 1
        return todo.id

    def get(self, id: int) -> Todo | None:
        """Retrieve a todo by ID.

        Args:
            id: The todo ID to retrieve.

        Returns:
            Todo instance if found, None otherwise.

        Note:
            Never raises KeyError for missing IDs.
        """
        return self._todos.get(id, None)

    def get_all(self) -> list[Todo]:
        """Retrieve all todos sorted by ID in ascending order.

        Returns:
            List of all Todo instances sorted by ID.
            Returns empty list if no todos exist.
        """
        return sorted(self._todos.values(), key=lambda t: t.id)

    def update(
        self,
        id: int,
        title: str | None = None,
        description: str | None = None,
        completed: bool | None = None
    ) -> bool:
        """Update specific fields of a todo.

        Only provided fields are modified; others remain unchanged.

        Args:
            id: The todo ID to update.
            title: New title (optional).
            description: New description (optional).
            completed: New completion status (optional).

        Returns:
            True if todo was updated successfully, False if ID not found.

        Raises:
            ValueError: If title is provided but empty or exceeds
                100 characters.
        """
        todo = self.get(id)
        if todo is None:
            return False

        if title is not None:
            if not title or len(title.strip()) == 0:
                raise ValueError("Title cannot be empty")
            if len(title) > 100:
                raise ValueError("Title cannot exceed 100 characters")
            todo.title = title

        if description is not None:
            todo.description = description

        if completed is not None:
            todo.completed = completed

        return True

    def delete(self, id: int) -> bool:
        """Remove a todo from storage.

        Args:
            id: The todo ID to delete.

        Returns:
            True if todo was deleted, False if ID not found.

        Note:
            Deleted IDs are not reused (next_id continues incrementing).
        """
        if id in self._todos:
            del self._todos[id]
            return True
        return False
