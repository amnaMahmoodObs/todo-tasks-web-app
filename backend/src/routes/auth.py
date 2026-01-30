"""
Authentication routes for user signup, login, logout, and token verification.

This module provides REST API endpoints for all authentication operations:
- POST /api/auth/signup - Register new user account
- POST /api/auth/login - Authenticate and issue JWT token
- POST /api/auth/logout - End user session
- GET /api/auth/verify - Verify JWT token validity

All routes follow the API contracts defined in specs/features/authentication/contracts/auth-contracts.md
"""

from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from sqlmodel import Session
from datetime import datetime

from ..db import get_session
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["authentication"])


# ==================== Request/Response Models ====================

class SignupRequest(BaseModel):
    """User signup request payload."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password (min 8 characters)")
    name: Optional[str] = Field(None, description="Optional display name")


class LoginRequest(BaseModel):
    """User login request payload."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserResponse(BaseModel):
    """User data response (excludes password_hash)."""
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class SignupResponse(BaseModel):
    """Response for successful signup."""
    user: UserResponse
    message: str


class LoginResponse(BaseModel):
    """Response for successful login with JWT token."""
    user: UserResponse
    token: str
    expires_at: str


class VerifyResponse(BaseModel):
    """Response for token verification."""
    valid: bool
    user: UserResponse
    expires_at: str


class LogoutResponse(BaseModel):
    """Response for successful logout."""
    message: str


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    code: Optional[str] = None


# ==================== Route Handlers ====================

@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=201,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid email format or password too short"},
        409: {"model": ErrorResponse, "description": "Email already registered"},
    },
)
async def signup(
    request: SignupRequest,
    session: Session = Depends(get_session),
) -> SignupResponse:
    """
    Register a new user account.

    Args:
        request: Signup request with email, password, and optional name
        session: Database session dependency

    Returns:
        SignupResponse with user data and success message

    Raises:
        HTTPException: 400 if validation fails, 409 if email exists
    """
    auth_service = AuthService(session)

    try:
        user = await auth_service.signup(
            email=request.email,
            password=request.password,
            name=request.name,
        )

        return SignupResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.created_at,
                updated_at=user.updated_at,
            ),
            message="Account created successfully. Please log in.",
        )

    except ValueError as e:
        # Email already exists
        raise HTTPException(
            status_code=409,
            detail=str(e),
        )
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during signup: {str(e)}",
        )


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
    },
)
async def login(
    request: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> LoginResponse:
    """
    Authenticate user and issue JWT token.

    Args:
        request: Login request with email and password
        response: FastAPI response to set cookies
        session: Database session dependency

    Returns:
        LoginResponse with user data and JWT token

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    auth_service = AuthService(session)

    try:
        user, token, expires_at = await auth_service.login(
            email=request.email,
            password=request.password,
        )

        # Set HTTP-only cookie with JWT token
        import os
        is_production = os.getenv("NODE_ENV") == "production"
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=is_production,  # HTTPS only in production
            samesite="lax" if not is_production else "strict",  # Lax for local dev
            max_age=60 * 60 * 24 * 7,  # 7 days in seconds
        )

        return LoginResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.created_at,
                updated_at=user.updated_at,
            ),
            token=token,
            expires_at=expires_at,
        )

    except ValueError as e:
        # Invalid credentials
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during login: {str(e)}",
        )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token"},
    },
)
async def logout(
    request: Request,
    response: Response,
) -> LogoutResponse:
    """
    End user session by clearing token.

    Args:
        request: FastAPI request with authenticated user
        response: FastAPI response to clear cookies

    Returns:
        LogoutResponse with success message
    """
    # Clear HTTP-only cookie by setting Max-Age to 0
    response.set_cookie(
        key="auth_token",
        value="",
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=0,  # Expire immediately
    )

    return LogoutResponse(message="Logged out successfully")


@router.get(
    "/verify",
    response_model=VerifyResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Token expired or invalid"},
    },
)
async def verify(
    request: Request,
    session: Session = Depends(get_session),
) -> VerifyResponse:
    """
    Verify JWT token validity and return current user.

    Args:
        request: FastAPI request with JWT token (injected by middleware)
        session: Database session dependency

    Returns:
        VerifyResponse with user data if token is valid

    Raises:
        HTTPException: 401 if token is invalid or expired

    Note:
        This endpoint relies on JWT middleware to extract and verify the token.
        The user_id and email are injected into request.state by the middleware.
    """
    auth_service = AuthService(session)

    try:
        # Get user_id from request state (set by JWT middleware)
        user_id = getattr(request.state, "user_id", None)
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Authentication required",
            )

        # Fetch user from database
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

        # Get token expiration from request state (set by JWT middleware)
        expires_at = getattr(request.state, "token_expires_at", None)

        return VerifyResponse(
            valid=True,
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.created_at,
                updated_at=user.updated_at,
            ),
            expires_at=expires_at or "",
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during verification: {str(e)}",
        )
