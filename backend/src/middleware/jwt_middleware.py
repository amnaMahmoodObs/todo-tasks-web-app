"""
JWT authentication middleware for FastAPI.

This middleware verifies JWT tokens on all requests (except auth endpoints),
extracts user information, and injects it into the request state for use
by route handlers.
"""

import jwt
import os
import logging
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)


class JWTMiddleware(BaseHTTPMiddleware):
    """
    Middleware to verify JWT tokens and inject user data into request state.

    This middleware:
    1. Skips auth endpoints (signup/login don't require authentication)
    2. Extracts JWT token from Authorization header
    3. Verifies token signature using BETTER_AUTH_SECRET
    4. Checks token expiration
    5. Injects user_id and email into request.state for route handlers

    Raises:
        HTTPException: 401 Unauthorized if token is missing, invalid, or expired
    """

    async def dispatch(self, request: Request, call_next):
        """
        Process request and verify JWT token.

        Args:
            request: Incoming FastAPI request
            call_next: Next middleware or route handler

        Returns:
            Response from next handler

        Raises:
            HTTPException: 401 if authentication fails
        """
        # Skip authentication for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip authentication for public auth endpoints only (signup/login)
        public_auth_paths = ["/api/auth/signup", "/api/auth/login"]
        if request.url.path in public_auth_paths:
            return await call_next(request)

        # Skip authentication for health/docs endpoints and static files
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico"]:
            return await call_next(request)

        # Extract Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            logger.warning(f"Missing Authorization header for {request.url.path}")
            raise HTTPException(
                status_code=401, detail="Authentication required"
            )

        # Verify Bearer token format
        if not auth_header.startswith("Bearer "):
            logger.warning(f"Invalid Authorization header format for {request.url.path}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token format. Expected 'Bearer <token>'",
            )

        # Extract token
        token = auth_header.split(" ")[1]

        # Verify JWT token
        try:
            payload = jwt.decode(
                token,
                os.getenv("BETTER_AUTH_SECRET"),
                algorithms=["HS256"],
            )

            # Extract user information from payload
            user_id = payload.get("user_id") or payload.get("sub")
            email = payload.get("email")

            if not user_id:
                logger.error("JWT payload missing user_id or sub claim")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token: missing user identifier",
                )

            # Inject user data into request state
            request.state.user_id = user_id
            request.state.email = email

            logger.info(f"Authenticated request from user {user_id} to {request.url.path}")

        except jwt.ExpiredSignatureError:
            logger.warning(f"Expired JWT token for {request.url.path}")
            raise HTTPException(
                status_code=401,
                detail="Token expired. Please log in again",
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token for {request.url.path}: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token",
            )
        except Exception as e:
            logger.error(f"Unexpected error during JWT verification: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Authentication failed",
            )

        # Call next middleware/handler
        return await call_next(request)
