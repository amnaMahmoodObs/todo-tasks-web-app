"""
Authentication service for handling user signup, login, and verification logic.

This module provides business logic for authentication operations:
- User registration with password hashing
- User login with password verification
- JWT token generation and validation
- User data retrieval

Note: This implementation uses bcrypt for password hashing and PyJWT for token generation.
Better Auth manages the users table schema on the frontend, but this service handles
backend authentication logic independently.
"""

import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlmodel import Session, select
from ..models import User


class AuthService:
    """
    Authentication service for user management and JWT operations.

    Attributes:
        session: Database session for user queries
    """

    def __init__(self, session: Session):
        """
        Initialize authentication service.

        Args:
            session: SQLModel database session
        """
        self.session = session
        self.jwt_secret = os.getenv("BETTER_AUTH_SECRET")
        if not self.jwt_secret:
            raise ValueError("BETTER_AUTH_SECRET environment variable is required")

    async def signup(
        self,
        email: str,
        password: str,
        name: Optional[str] = None,
    ) -> User:
        """
        Register a new user account.

        Args:
            email: User's email address
            password: User's password (plain text, will be hashed)
            name: Optional display name

        Returns:
            Created User object

        Raises:
            ValueError: If email already exists or validation fails
        """
        # Validate email uniqueness
        existing_user = self.session.exec(
            select(User).where(User.email == email)
        ).first()

        if existing_user:
            raise ValueError("This email is already registered. Please log in instead")

        # Hash password with bcrypt
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # Create user record
        user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)

        return user

    async def login(
        self,
        email: str,
        password: str,
    ) -> Tuple[User, str, str]:
        """
        Authenticate user and generate JWT token.

        Args:
            email: User's email address
            password: User's password (plain text)

        Returns:
            Tuple of (User object, JWT token string, expiration timestamp ISO 8601)

        Raises:
            ValueError: If credentials are invalid
        """
        # Find user by email
        user = self.session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user:
            raise ValueError("Invalid email or password")

        # Verify password with bcrypt
        if not bcrypt.checkpw(
            password.encode("utf-8"),
            user.password_hash.encode("utf-8")
        ):
            raise ValueError("Invalid email or password")

        # Generate JWT token
        token, expires_at = self._generate_jwt_token(user)

        return user, token, expires_at

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Retrieve user by ID.

        Args:
            user_id: User's unique identifier (UUID)

        Returns:
            User object if found, None otherwise
        """
        return self.session.exec(
            select(User).where(User.id == user_id)
        ).first()

    def _generate_jwt_token(self, user: User) -> Tuple[str, str]:
        """
        Generate JWT token for authenticated user.

        Args:
            user: User object

        Returns:
            Tuple of (JWT token string, expiration timestamp ISO 8601)
        """
        # Calculate expiration time (7 days from now)
        issued_at = datetime.utcnow()
        expires_at = issued_at + timedelta(days=7)

        # Create JWT payload
        payload = {
            "user_id": user.id,
            "email": user.email,
            "iat": int(issued_at.timestamp()),
            "exp": int(expires_at.timestamp()),
            "sub": user.id,  # Subject identifier
        }

        # Encode JWT token with HS256 algorithm
        token = jwt.encode(
            payload,
            self.jwt_secret,
            algorithm="HS256"
        )

        # Return token and ISO 8601 expiration timestamp
        return token, expires_at.isoformat() + "Z"

    def verify_jwt_token(self, token: str) -> dict:
        """
        Verify JWT token signature and extract payload.

        Args:
            token: JWT token string

        Returns:
            Decoded token payload with user_id and email

        Raises:
            jwt.ExpiredSignatureError: If token has expired
            jwt.InvalidTokenError: If token signature is invalid
        """
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise jwt.ExpiredSignatureError("Token expired. Please log in again")
        except jwt.InvalidTokenError:
            raise jwt.InvalidTokenError("Invalid authentication token")
