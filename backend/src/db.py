"""
Database connection and session management for Neon PostgreSQL.

This module provides database engine creation, table initialization,
and session management using SQLModel.
"""

from sqlmodel import create_engine, SQLModel, Session
from typing import Generator
import os
from dotenv import load_dotenv

# Import all models to ensure they're registered with SQLModel metadata
from src.models import User, Task  # noqa: F401

# Load environment variables
load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create SQLModel engine for PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Connection pool size
    max_overflow=10,  # Maximum overflow connections
)


def create_db_and_tables():
    """
    Create all database tables defined in SQLModel models.

    Note: Better Auth manages the users table schema, so this primarily
    ensures the table exists and matches the User model definition.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.

    Yields:
        Database session that automatically closes after use

    Usage:
        @app.get("/endpoint")
        async def endpoint(session: Session = Depends(get_session)):
            # Use session here
            pass
    """
    with Session(engine) as session:
        yield session
