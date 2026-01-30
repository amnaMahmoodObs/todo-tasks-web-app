"""
Application configuration management.

Loads and validates environment variables required for the application.
"""

import os
from dotenv import load_dotenv
from dataclasses import dataclass

# Load environment variables from .env file
load_dotenv()


@dataclass
class Settings:
    """
    Application settings from environment variables.

    Attributes:
        BETTER_AUTH_SECRET: Shared secret for JWT verification (must match frontend)
        DATABASE_URL: PostgreSQL connection string for Neon database
        FRONTEND_URL: Frontend application URL for CORS configuration
    """

    BETTER_AUTH_SECRET: str
    DATABASE_URL: str
    FRONTEND_URL: str

    def __init__(self):
        """Initialize settings from environment variables with validation."""
        self.BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET", "")
        self.DATABASE_URL = os.getenv("DATABASE_URL", "")
        self.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

        # Validate required settings
        self._validate()

    def _validate(self):
        """
        Validate that all required settings are present.

        Raises:
            ValueError: If any required setting is missing
        """
        if not self.BETTER_AUTH_SECRET:
            raise ValueError(
                "BETTER_AUTH_SECRET environment variable is required. "
                "Generate one with: openssl rand -hex 32"
            )

        if len(self.BETTER_AUTH_SECRET) < 32:
            raise ValueError(
                "BETTER_AUTH_SECRET must be at least 32 characters long for security"
            )

        if not self.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Format: postgresql://user:password@host.neon.tech/dbname?sslmode=require"
            )

        if not self.DATABASE_URL.startswith("postgresql://"):
            raise ValueError("DATABASE_URL must be a valid PostgreSQL connection string")


# Global settings instance
settings = Settings()
