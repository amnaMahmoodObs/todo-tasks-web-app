# Backend Development Guide - FastAPI + JWT Authentication

This file provides context and guidance for developing the FastAPI backend with JWT authentication.

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.13+
- **ORM**: SQLModel
- **Database**: Neon PostgreSQL
- **Authentication**: JWT (PyJWT library)
- **Environment**: python-dotenv

## Project Structure

```
backend/
├── src/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Configuration from environment variables
│   ├── db.py                    # Database connection and session
│   ├── models.py                # SQLModel database models (User)
│   ├── routes/
│   │   └── auth.py              # Authentication endpoints
│   ├── services/
│   │   └── auth_service.py      # Authentication business logic
│   └── middleware/
│       └── jwt_middleware.py    # JWT verification middleware
├── tests/
│   ├── contract/                # API contract tests
│   └── integration/             # Integration tests
├── requirements.txt             # Python dependencies
├── pyproject.toml               # Project configuration
└── .env                         # Environment variables
```

## Database Models

User model in `src/models.py` (read-only, managed by Better Auth on frontend):

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class User(SQLModel, table=True):
    """
    User account model (managed by Better Auth).

    This model is READ-ONLY from the backend perspective.
    Better Auth handles user creation, password hashing, and schema management.
    """
    __tablename__ = "users"

    id: str = Field(
        primary_key=True,
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique user identifier (UUID)"
    )
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address for login"
    )
    password_hash: str = Field(
        max_length=255,
        description="Bcrypt-hashed password (managed by Better Auth)"
    )
    name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional display name"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )
```

## JWT Verification Middleware

Middleware in `src/middleware/jwt_middleware.py` verifies all requests:

```python
import jwt
import os
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth endpoints
        if request.url.path.startswith("/api/auth"):
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Authentication required"
            )

        token = auth_header.split(" ")[1]

        # Verify JWT
        try:
            payload = jwt.decode(
                token,
                os.getenv("BETTER_AUTH_SECRET"),
                algorithms=["HS256"]
            )
            # Inject user data into request state
            request.state.user_id = payload.get("user_id")
            request.state.email = payload.get("email")
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token expired. Please log in again"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return await call_next(request)
```

## CORS Configuration

Configure CORS in `src/main.py` to allow frontend communication:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS configuration
allowed_origins = [
    "http://localhost:3000",  # Development frontend
    os.getenv("FRONTEND_URL", "https://your-app.vercel.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Required for HTTP-only cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,  # Preflight cache duration
)
```

## Authentication Routes

Example auth route structure in `src/routes/auth.py`:

```python
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class AuthResponse(BaseModel):
    user: dict
    message: str

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(request: SignupRequest):
    """
    Register a new user account.

    Args:
        request: Signup request with email, password, and optional name

    Returns:
        AuthResponse with user data and success message

    Raises:
        HTTPException: 400 if validation fails, 409 if email exists
    """
    # Validation
    if len(request.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )

    # Check if user exists (query users table)
    # Create user via Better Auth or direct SQL
    # Return response
    pass

@router.post("/login")
async def login(request: LoginRequest):
    """
    Authenticate user and issue JWT token.

    Args:
        request: Login request with email and password

    Returns:
        AuthResponse with user data and JWT token

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    pass

@router.post("/logout")
async def logout(request: Request):
    """
    End user session by clearing token.

    Args:
        request: FastAPI request with authenticated user

    Returns:
        Success message
    """
    pass

@router.get("/verify")
async def verify(request: Request):
    """
    Verify JWT token validity and return current user.

    Args:
        request: FastAPI request with JWT token

    Returns:
        User data if token is valid

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    pass
```

## Database Connection

Database setup in `src/db.py`:

```python
from sqlmodel import create_engine, SQLModel, Session
from typing import Generator
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using
)

def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get database session.

    Yields:
        Database session
    """
    with Session(engine) as session:
        yield session
```

## Configuration Management

Load environment variables in `src/config.py`:

```python
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    """Application settings from environment variables."""

    BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    def __post_init__(self):
        """Validate required settings."""
        if not self.BETTER_AUTH_SECRET:
            raise ValueError("BETTER_AUTH_SECRET environment variable is required")
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")

settings = Settings()
```

## Environment Variables

Required environment variables in `.env`:

```bash
# Better Auth Shared Secret (MUST match frontend)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-here

# Database Connection
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Python Environment
PYTHONPATH=src
```

**CRITICAL**: The `BETTER_AUTH_SECRET` must be identical in both frontend and backend!

## Error Handling

Use FastAPI's HTTPException for consistent error responses:

```python
from fastapi import HTTPException

# 400 Bad Request - Validation errors
raise HTTPException(
    status_code=400,
    detail="Invalid email format"
)

# 401 Unauthorized - Authentication errors
raise HTTPException(
    status_code=401,
    detail="Invalid email or password"
)

# 409 Conflict - Resource conflicts
raise HTTPException(
    status_code=409,
    detail="This email is already registered"
)

# 500 Internal Server Error - Unexpected errors
raise HTTPException(
    status_code=500,
    detail="An unexpected error occurred"
)
```

## Development Commands

```bash
# Install dependencies
pip install -r requirements.txt
# or with uv
uv sync

# Run development server
uvicorn src.main:app --reload --port 8000

# Run with environment variables
export BETTER_AUTH_SECRET=your-secret
export DATABASE_URL=postgresql://...
uvicorn src.main:app --reload

# Format code
black src/
isort src/

# Type checking
mypy src/
```

## Testing Strategy

For Phase II, manual testing is used (no automated tests). Test with curl:

```bash
# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123","name":"Test"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}' \
  -c cookies.txt

# Test authenticated request
curl http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer <jwt-token-here>"
```

## Security Best Practices

- ✅ Never store plain-text passwords (Better Auth handles hashing)
- ✅ Use parameterized queries (SQLModel enforces this)
- ✅ Validate all user input with Pydantic models
- ✅ Log authentication failures for security monitoring
- ✅ Use HTTPS in production (enforce with middleware)
- ✅ Set appropriate CORS origins (never use "*" with credentials)
- ✅ Implement rate limiting for login attempts (future enhancement)

## Common Issues

### "Database connection failed"
**Solution**: Verify `DATABASE_URL` format and network access to Neon PostgreSQL.

### "Token verification failed"
**Solution**: Ensure `BETTER_AUTH_SECRET` matches the frontend exactly.

### "CORS policy blocking requests"
**Solution**: Add frontend URL to `allowed_origins` list in CORS middleware.

### "Module not found errors"
**Solution**: Set `PYTHONPATH=src` or run from project root.

## Data Isolation Pattern

Always filter queries by `user_id` from JWT token:

```python
from fastapi import Request, Depends
from sqlmodel import Session, select
from src.db import get_session
from src.models import Task

@router.get("/api/tasks")
async def get_tasks(
    request: Request,
    session: Session = Depends(get_session)
):
    """Get tasks for authenticated user only."""
    user_id = request.state.user_id

    tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()

    return {"tasks": tasks}
```

## Next Steps

After authentication is complete:
1. Implement task CRUD endpoints
2. Add user data isolation to all queries
3. Implement proper logging and monitoring
4. Add rate limiting for security
5. Consider adding refresh token rotation
