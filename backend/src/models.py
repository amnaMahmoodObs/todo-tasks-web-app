"""
Database models for the todo application.

This module defines SQLModel models for database tables and Pydantic models
for API request/response validation.
The User model is READ-ONLY from the backend - Better Auth manages user data.
"""

from sqlmodel import SQLModel, Field
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
import uuid


class User(SQLModel, table=True):
    """
    User account model (managed by Better Auth on frontend).

    This model is READ-ONLY from the backend perspective.
    Better Auth handles user creation, password hashing, and schema management.
    The backend only reads from this table for user data filtering.

    Attributes:
        id: Unique user identifier (UUID)
        email: User's email address for login (unique)
        password_hash: Bcrypt-hashed password (never exposed to API)
        name: Optional display name
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "users"

    id: str = Field(
        primary_key=True,
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique user identifier (UUID)",
    )
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address for login",
    )
    password_hash: str = Field(
        max_length=255,
        description="Bcrypt-hashed password (managed by Better Auth)",
    )
    name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional display name",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp",
    )

    class Config:
        """SQLModel configuration."""

        # Use UTC for all datetime fields
        json_encoders = {datetime: lambda v: v.isoformat()}


class Task(SQLModel, table=True):
    """
    Task model representing a user's todo item.

    Each task has a title, optional description, completion status, and timestamps.
    Tasks are owned by a user and include strict user isolation.

    Attributes:
        id: Auto-incrementing primary key
        user_id: Foreign key to users table (UUID string)
        title: Task title (required, max 200 characters)
        description: Optional task description (max 1000 characters)
        completed: Completion status (default: False)
        created_at: Creation timestamp (auto-set, immutable)
        updated_at: Last modification timestamp (auto-updated)
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        max_length=255,
        description="Owner of this task (UUID)",
    )
    title: str = Field(
        max_length=200, description="Task title (required, max 200 characters)"
    )
    description: Optional[str] = Field(
        default=None, description="Optional task description (max 1000 characters)"
    )
    completed: bool = Field(
        default=False, index=True, description="Whether task is completed"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Creation timestamp (immutable)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Last update timestamp (auto-updated)",
    )

    class Config:
        """SQLModel configuration."""

        # Use UTC for all datetime fields
        json_encoders = {datetime: lambda v: v.isoformat()}


# ============================================================================
# Pydantic Models for Task API Request/Response Validation
# ============================================================================


class TaskCreate(BaseModel):
    """
    Request body for creating a new task.

    Attributes:
        title: Task title (required, 1-200 characters, not whitespace-only)
        description: Optional description (max 1000 characters)
    """

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    @validator("title")
    def title_not_empty(cls, v: str) -> str:
        """Ensure title is not whitespace-only."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace-only")
        return v.strip()

    @validator("description")
    def description_clean(cls, v: Optional[str]) -> Optional[str]:
        """Strip whitespace from description if present."""
        return v.strip() if v else None


class TaskUpdate(BaseModel):
    """
    Request body for updating a task.

    All fields are optional - only provided fields will be updated.

    Attributes:
        title: Updated task title (1-200 characters, not whitespace-only)
        description: Updated description (max 1000 characters)
    """

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    @validator("title")
    def title_valid_if_present(cls, v: Optional[str]) -> Optional[str]:
        """If title provided, ensure it's valid."""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Title cannot be empty or whitespace-only")
        return v.strip() if v else v

    @validator("description")
    def description_clean(cls, v: Optional[str]) -> Optional[str]:
        """Strip whitespace from description."""
        return v.strip() if v else None


class TaskResponse(BaseModel):
    """
    Response body for task endpoints.

    Attributes:
        id: Unique task identifier
        user_id: Owner user ID
        title: Task title
        description: Optional description
        completed: Completion status
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """

    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""

        from_attributes = True  # Allow SQLModel to dict conversion
        json_encoders = {datetime: lambda v: v.isoformat()}
