# Research: User Authentication

**Feature**: Authentication
**Date**: 2026-01-28
**Status**: Complete
**Purpose**: Research technical decisions and best practices for implementing Better Auth + JWT authentication in a Next.js/FastAPI monorepo

## Research Questions

1. How to integrate Better Auth with Next.js 16+ App Router and enable JWT plugin?
2. How to implement JWT verification middleware in FastAPI?
3. How does Better Auth manage user schema in Neon PostgreSQL?
4. What is the most secure JWT token storage approach for web applications?
5. How to configure CORS for Next.js frontend + FastAPI backend communication?

---

## Decision 1: Better Auth + JWT Plugin Integration

**Question**: How to integrate Better Auth with Next.js 16+ App Router and enable JWT plugin?

**Decision**: Use Better Auth as the primary authentication library with the JWT plugin enabled to issue tokens on successful login.

**Rationale**:
- Better Auth is designed specifically for Next.js and provides built-in session management
- JWT plugin enables stateless authentication, allowing frontend and backend to operate independently
- App Router compatibility ensures we use Next.js 16+ modern patterns (Server Components, Server Actions)
- Better Auth handles password hashing, email validation, and session management out of the box

**Alternatives Considered**:
1. **NextAuth.js**: Popular but primarily designed for server-side session management; JWT support exists but less straightforward than Better Auth's JWT plugin
2. **Auth0/Clerk**: Third-party services - rejected due to external dependencies and cost considerations for Phase II
3. **Custom JWT implementation**: Reinventing the wheel - rejected due to security risks and increased development time

**Implementation Approach**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL
  },
  plugins: [
    jwt({
      expiresIn: "7d", // 7-day expiration
      secret: process.env.BETTER_AUTH_SECRET
    })
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8
  }
})
```

**References**:
- Better Auth Docs: JWT Plugin configuration
- Next.js 16 App Router authentication patterns
- Better Auth + PostgreSQL integration guide

---

## Decision 2: FastAPI JWT Verification Middleware

**Question**: How to implement JWT verification middleware in FastAPI?

**Decision**: Create custom FastAPI middleware using `PyJWT` library to verify JWT tokens, extract user_id, and inject into request state for downstream route handlers.

**Rationale**:
- Middleware approach ensures ALL protected endpoints automatically verify JWT without repetitive code
- `PyJWT` is the standard Python library for JWT operations, well-maintained and widely used
- Extracting user_id to request state makes it accessible to all route handlers for data filtering
- Centralized verification logic enables consistent security enforcement

**Alternatives Considered**:
1. **Dependency injection per route**: Repetitive and error-prone - rejected
2. **python-jose**: Another JWT library - PyJWT is more popular and better documented
3. **FastAPI-Users**: Full authentication framework - too heavyweight for our needs, we only need JWT verification

**Implementation Approach**:
```python
# middleware/jwt_middleware.py
from fastapi import Request, HTTPException
from jose import jwt, JWTError
import os

async def jwt_middleware(request: Request, call_next):
    # Skip auth endpoints
    if request.url.path.startswith("/api/auth"):
        return await call_next(request)

    # Extract token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = auth_header.split(" ")[1]

    # Verify JWT
    try:
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        request.state.user_id = payload.get("user_id")
        request.state.email = payload.get("email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    return await call_next(request)
```

**References**:
- PyJWT Documentation
- FastAPI Middleware Guide
- JWT verification best practices

---

## Decision 3: Neon PostgreSQL + Better Auth User Schema

**Question**: How does Better Auth manage user schema in Neon PostgreSQL?

**Decision**: Let Better Auth automatically create and manage the `users` table schema in Neon PostgreSQL. The backend will reference this table via SQLModel for user data filtering but will not modify the schema.

**Rationale**:
- Better Auth has built-in schema management for users table (id, email, password_hash, created_at, etc.)
- Neon PostgreSQL is fully PostgreSQL-compatible, so Better Auth's schema works without modification
- Separation of concerns: Better Auth owns user authentication data, backend owns application data (tasks)
- Foreign key relationships from `tasks` table to `users.id` enable data isolation

**Alternatives Considered**:
1. **Manual schema management**: Complex and error-prone - rejected
2. **Separate authentication database**: Unnecessary complexity for Phase II - rejected
3. **Custom user table schema**: Would break Better Auth integration - rejected

**Implementation Approach**:
```python
# models.py (Backend)
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

# User model (read-only, managed by Better Auth)
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)  # UUID from Better Auth
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    created_at: datetime

    # Relationship to tasks
    tasks: list["Task"] = Relationship(back_populates="user")

# Task model (managed by backend)
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime
    updated_at: datetime

    # Relationship to user
    user: User = Relationship(back_populates="tasks")
```

**Neon PostgreSQL Configuration**:
- Connection string format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
- SSL required by default (aligns with security requirements)
- Serverless architecture handles connection pooling automatically

**References**:
- Better Auth PostgreSQL Setup
- Neon PostgreSQL Documentation
- SQLModel + PostgreSQL best practices

---

## Decision 4: JWT Token Storage - HTTP-only Cookies vs localStorage

**Question**: What is the most secure JWT token storage approach for web applications?

**Decision**: Use **HTTP-only secure cookies** as the primary token storage mechanism, with **localStorage as a documented fallback** if deployment constraints require it.

**Rationale**:
- **HTTP-only cookies** are immune to XSS (Cross-Site Scripting) attacks because JavaScript cannot access them
- **Secure flag** ensures cookies are only sent over HTTPS (required in production)
- **SameSite=Strict** prevents CSRF (Cross-Site Request Forgery) attacks
- localStorage is vulnerable to XSS but may be necessary for certain deployment scenarios (documented in assumptions)

**Alternatives Considered**:
1. **localStorage only**: Simple but vulnerable to XSS - rejected as primary approach
2. **sessionStorage**: Cleared on tab close, breaks "remember me" functionality - rejected
3. **IndexedDB**: Overly complex for simple token storage - rejected

**Implementation Approach**:

**Frontend (Better Auth Config)**:
```typescript
// lib/auth.ts
export const auth = betterAuth({
  // ... other config
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
    },
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict" // CSRF protection
  }
})
```

**Frontend (API Client)**:
```typescript
// lib/api-client.ts
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Cookies automatically attached by browser
  // Include credentials for cross-origin requests
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Send cookies with request
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  })

  return response
}
```

**Backend (CORS Config)**:
```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Specific origin, not "*"
    allow_credentials=True,  # Allow cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Security Trade-offs**:
| Approach | XSS Protection | CSRF Protection | Ease of Use |
|----------|----------------|-----------------|-------------|
| HTTP-only Cookies | ✅ Excellent | ✅ (with SameSite) | ✅ Automatic |
| localStorage | ❌ Vulnerable | ✅ N/A | ✅ Simple |

**References**:
- OWASP JWT Security Cheat Sheet
- Better Auth Cookie Configuration
- FastAPI CORS Middleware Documentation

---

## Decision 5: CORS Configuration for Frontend-Backend Communication

**Question**: How to configure CORS for Next.js frontend + FastAPI backend communication?

**Decision**: Configure FastAPI with specific CORS origins (development + production frontend URLs), enable credentials, and allow all HTTP methods for authenticated requests.

**Rationale**:
- **Specific origins** (not wildcard `*`) required when `allow_credentials=True` for cookie-based authentication
- **allow_credentials=True** enables JWT tokens to be sent in HTTP-only cookies
- **Development + Production origins** accommodate both local development and deployed environments
- **Preflight caching** improves performance by reducing OPTIONS requests

**Alternatives Considered**:
1. **Wildcard origins (`*`)**: Insecure and incompatible with credentials - rejected
2. **No CORS (same-origin deployment)**: Limits deployment flexibility - rejected
3. **Reverse proxy (Nginx/Caddy)**: Adds deployment complexity for Phase II - deferred to later phases

**Implementation Approach**:

**Backend (FastAPI CORS)**:
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS configuration
allowed_origins = [
    "http://localhost:3000",  # Development frontend
    os.getenv("FRONTEND_URL", "https://your-app.vercel.app"),  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Required for HTTP-only cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,  # Preflight cache duration (10 minutes)
)
```

**Environment Variables**:
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000  # Development
# NEXT_PUBLIC_API_URL=https://api.your-app.com  # Production

# backend/.env
FRONTEND_URL=http://localhost:3000  # Development
# FRONTEND_URL=https://your-app.vercel.app  # Production
BETTER_AUTH_SECRET=<shared-secret-key>
DATABASE_URL=postgresql://...@...neon.tech/...
```

**Security Considerations**:
- Never use `allow_origins=["*"]` with `allow_credentials=True` (FastAPI will reject this)
- Frontend URL must exactly match (including protocol and port)
- Use environment variables to manage different origins per environment
- Preflight cache (`max_age`) reduces OPTIONS request overhead

**References**:
- FastAPI CORS Middleware Documentation
- MDN Web Docs: CORS
- OWASP CORS Security Guide

---

## Summary of Research Findings

### Confirmed Technical Decisions

1. **Better Auth + JWT Plugin**: Primary authentication library for Next.js with JWT token generation
2. **PyJWT Middleware**: FastAPI middleware for centralized JWT verification
3. **Better Auth Managed Schema**: Let Better Auth control users table in Neon PostgreSQL
4. **HTTP-only Cookies (Primary)**: Most secure token storage with localStorage as fallback
5. **Specific CORS Origins**: FastAPI configured with explicit frontend URLs and credentials enabled

### Key Integration Points

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| Frontend Auth UI | User registration/login forms | Next.js + Better Auth |
| JWT Token Generation | Issue tokens on successful auth | Better Auth JWT plugin |
| JWT Token Storage | Store tokens securely | HTTP-only cookies (primary) |
| JWT Token Transmission | Attach to API requests | Browser (automatic with cookies) |
| JWT Token Verification | Verify signature and extract user | FastAPI middleware + PyJWT |
| User Data Isolation | Filter queries by user_id | SQLModel queries with user_id filter |
| User Schema Management | Create and maintain users table | Better Auth |

### Security Checklist

- ✅ Passwords hashed (Better Auth default: bcrypt)
- ✅ JWT tokens expire after 7 days
- ✅ Shared secret (BETTER_AUTH_SECRET) in environment variables
- ✅ HTTP-only cookies protect against XSS
- ✅ SameSite cookies protect against CSRF
- ✅ HTTPS enforced in production
- ✅ Specific CORS origins (no wildcards)
- ✅ User data isolation via user_id filtering
- ✅ Authentication failure logging

### Next Steps

1. **Phase 1**: Create data models (`data-model.md`)
2. **Phase 1**: Define API contracts (`contracts/` directory)
3. **Phase 1**: Write quickstart guide (`quickstart.md`)
4. **Phase 2**: Generate tasks (`tasks.md`) via `/sp.tasks` command
5. **Phase 3**: Implement via `/sp.implement` command

---

**Research Status**: ✅ COMPLETE - All technical decisions documented with rationale and alternatives
