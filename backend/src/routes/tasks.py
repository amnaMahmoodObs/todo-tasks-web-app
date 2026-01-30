"""
Task management API endpoints.

This module implements RESTful CRUD operations for tasks with strict
user isolation enforced at every endpoint.
"""

from fastapi import APIRouter, HTTPException, Request, Depends, status
from sqlmodel import Session, select
from src.db import get_session
from src.models import Task, TaskCreate, TaskUpdate, TaskResponse
from typing import List
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create API router for task endpoints
router = APIRouter(prefix="/api", tags=["tasks"])


def validate_user_access(request: Request, user_id: str) -> None:
    """
    Validate that the authenticated user matches the user_id in the URL.

    This enforces user isolation at the route level.

    Args:
        request: FastAPI request with authenticated user in request.state
        user_id: User ID from URL path parameter

    Raises:
        HTTPException: 403 Forbidden if user_id mismatch
    """
    authenticated_user_id = request.state.user_id
    if authenticated_user_id != user_id:
        logger.warning(
            f"Access denied: User {authenticated_user_id} attempted to access "
            f"resources for user {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own tasks.",
        )


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task for the authenticated user with title and optional description.",
)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    request: Request,
    session: Session = Depends(get_session),
) -> Task:
    """
    Create a new task for the authenticated user.

    Args:
        user_id: User ID from URL path
        task_data: Task creation data (title and optional description)
        request: FastAPI request with authenticated user
        session: Database session

    Returns:
        Created task with all fields

    Raises:
        HTTPException: 400 for validation errors, 403 for access denial
    """
    # Validate user isolation
    validate_user_access(request, user_id)

    # Create new task
    new_task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
        completed=False,
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    logger.info(f"Created task {new_task.id} for user {user_id}")
    return new_task


@router.get(
    "/{user_id}/tasks",
    response_model=dict,
    summary="List all tasks",
    description="Get all tasks for the authenticated user, ordered by creation date (newest first).",
)
async def list_tasks(
    user_id: str,
    request: Request,
    session: Session = Depends(get_session),
) -> dict:
    """
    Get all tasks for the authenticated user.

    Args:
        user_id: User ID from URL path
        request: FastAPI request with authenticated user
        session: Database session

    Returns:
        Dictionary with tasks array and count

    Raises:
        HTTPException: 403 for access denial
    """
    # Validate user isolation
    validate_user_access(request, user_id)

    # Query tasks filtered by user_id, ordered by creation date (newest first)
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    tasks = session.exec(statement).all()

    logger.info(f"Retrieved {len(tasks)} tasks for user {user_id}")
    return {"tasks": tasks, "count": len(tasks)}


@router.get(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Get task by ID",
    description="Get a single task by ID for the authenticated user.",
)
async def get_task(
    user_id: str,
    task_id: int,
    request: Request,
    session: Session = Depends(get_session),
) -> Task:
    """
    Get a single task by ID for the authenticated user.

    Args:
        user_id: User ID from URL path
        task_id: Task ID
        request: FastAPI request with authenticated user
        session: Database session

    Returns:
        Task with specified ID

    Raises:
        HTTPException: 403 for access denial, 404 if task not found
    """
    # Validate user isolation
    validate_user_access(request, user_id)

    # Query task with user_id filter (prevents cross-user access)
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(
            f"Task {task_id} not found for user {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    logger.info(f"Retrieved task {task_id} for user {user_id}")
    return task


@router.put(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Update task details",
    description="Update a task's title and/or description.",
)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    request: Request,
    session: Session = Depends(get_session),
) -> Task:
    """
    Update a task's title and/or description.

    Args:
        user_id: User ID from URL path
        task_id: Task ID
        task_data: Updated task data
        request: FastAPI request with authenticated user
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: 403 for access denial, 404 if not found, 400 for validation
    """
    # Validate user isolation
    validate_user_access(request, user_id)

    # Query task with user_id filter
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(
            f"Task {task_id} not found for user {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description

    # updated_at will be auto-updated by SQLModel
    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"Updated task {task_id} for user {user_id}")
    return task


@router.delete(
    "/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Permanently delete a task.",
)
async def delete_task(
    user_id: str,
    task_id: int,
    request: Request,
    session: Session = Depends(get_session),
) -> None:
    """
    Permanently delete a task.

    Args:
        user_id: User ID from URL path
        task_id: Task ID
        request: FastAPI request with authenticated user
        session: Database session

    Raises:
        HTTPException: 403 for access denial, 404 if not found
    """
    # Validate user isolation
    validate_user_access(request, user_id)

    # Query task with user_id filter
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(
            f"Task {task_id} not found for user {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Hard delete
    session.delete(task)
    session.commit()

    logger.info(f"Deleted task {task_id} for user {user_id}")


@router.patch(
    "/{user_id}/tasks/{task_id}/complete",
    response_model=TaskResponse,
    summary="Toggle task completion",
    description="Toggle a task's completion status (complete <-> incomplete).",
)
async def toggle_task_complete(
    user_id: str,
    task_id: int,
    request: Request,
    session: Session = Depends(get_session),
) -> Task:
    """
    Toggle a task's completion status.

    Args:
        user_id: User ID from URL path
        task_id: Task ID
        request: FastAPI request with authenticated user
        session: Database session

    Returns:
        Task with toggled completion status

    Raises:
        HTTPException: 403 for access denial, 404 if not found
    """
    # Validate user isolation
    validate_user_access(request, user_id)

    # Query task with user_id filter
    statement = select(Task).where(
        Task.id == task_id, Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        logger.warning(
            f"Task {task_id} not found for user {user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Toggle completion status
    task.completed = not task.completed

    # updated_at will be auto-updated by SQLModel
    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(
        f"Toggled task {task_id} completion to {task.completed} for user {user_id}"
    )
    return task
