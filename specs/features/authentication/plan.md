# Implementation Plan: User Authentication

**Branch**: `001-user-auth` | **Date**: 2026-01-28 | **Spec**: [authentication spec](./spec.md)
**Input**: Feature specification from `specs/features/authentication/spec.md`

## Summary

Implement multi-user authentication system for Phase II Todo Full-Stack Web Application using Better Auth with JWT tokens. Frontend (Next.js 16+) handles user registration/login UI and JWT token storage. Backend (FastAPI) verifies JWT signatures and enforces user data isolation. Shared secret (BETTER_AUTH_SECRET) enables stateless authentication across frontend/backend boundaries.

**Primary Requirement**: Enable secure user authentication with registration, login, JWT token management, and logout functionality.

**Technical Approach**: Leverage Better Auth library on frontend for authentication flows and JWT token generation. Implement JWT verification middleware on FastAPI backend to extract user_id from tokens and filter all database queries. Store user data in Neon PostgreSQL with Better Auth managing the users table schema.

## Technical Context

**Language/Version**:
- Frontend: TypeScript with Next.js 16+ (App Router)
- Backend: Python 3.13+

**Primary Dependencies**:
- Frontend: Better Auth (with JWT plugin), Next.js 16+, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLModel, Pydantic, PyJWT (for JWT verification), python-dotenv

**Storage**: Neon Serverless PostgreSQL (users table managed by Better Auth)

**Testing**:
- Frontend: Jest + React Testing Library (manual testing for Phase II)
- Backend: pytest + httpx (manual testing for Phase II)

**Target Platform**: Web application (browser-based frontend + server-based backend API)

**Project Type**: Web application (monorepo with separate frontend and backend)

**Performance Goals**:
- User registration: <3 seconds response time
- User login: <2 seconds response time
- JWT verification: <50ms per request
- Support 100 concurrent login requests without degradation

**Constraints**:
- JWT tokens expire after exactly 7 days
- HTTPS required in production
- No manual coding (all code generated via Claude Code from specs)
- Backend must verify every JWT token before processing protected requests
- Zero plain-text passwords stored

**Scale/Scope**:
- Initial deployment: 100-1000 users
- Growth target: 10,000 users
- JWT token payload: <1KB
- Authentication endpoints: 4 (signup, login, logout, verify)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Spec-Driven Development (NON-NEGOTIABLE)
- **Status**: PASS
- **Evidence**: Full specification created at `specs/features/authentication/spec.md` with 20 functional requirements, 10 success criteria, and 4 prioritized user stories
- **Compliance**: All code will be generated via Claude Code following `/sp.plan` → `/sp.tasks` → `/sp.implement` workflow

### ✅ Principle II: Monorepo Architecture (NON-NEGOTIABLE)
- **Status**: PASS
- **Evidence**: Authentication feature uses monorepo structure with:
  - `frontend/` for Next.js application
  - `backend/` for FastAPI application
  - `specs/features/authentication/` for specifications
- **Compliance**: Clear separation maintained; shared specs in `/specs/`

### ✅ Principle III: Layered CLAUDE.md Context Files
- **Status**: PASS
- **Evidence**: Will create:
  - Root `/CLAUDE.md` for project overview
  - `/frontend/CLAUDE.md` for Next.js patterns and Better Auth usage
  - `/backend/CLAUDE.md` for FastAPI patterns and JWT verification
- **Compliance**: Each subsystem gets specific context file

### ✅ Principle IV: Spec-Kit Plus Organization
- **Status**: PASS
- **Evidence**: Specifications organized per constitution:
  - Feature spec: `specs/features/authentication/spec.md`
  - This plan: `specs/features/authentication/plan.md`
  - Will create: `specs/database/users-schema.md`, `specs/api/auth-endpoints.md`
- **Compliance**: Following Spec-Kit Plus conventions

### ✅ Principle V: Technology Stack Adherence (NON-NEGOTIABLE)
- **Status**: PASS
- **Evidence**: Using exact stack specified:
  - Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS, Better Auth
  - Backend: Python FastAPI, SQLModel
  - Database: Neon Serverless PostgreSQL
- **Compliance**: No substitutions; exact stack match

### ✅ Principle VI: RESTful API Design
- **Status**: PASS
- **Evidence**: API endpoints follow REST conventions with JWT authentication:
  - POST `/api/auth/signup` - Register new user
  - POST `/api/auth/login` - Authenticate and get JWT
  - POST `/api/auth/logout` - End session
  - GET `/api/auth/verify` - Verify JWT token validity
- **Compliance**: All endpoints require JWT (except signup/login); stateless design

### ✅ Principle VII: Security & Authentication First
- **Status**: PASS
- **Evidence**: Security built from the start:
  - JWT tokens with 7-day expiration
  - Shared secret (BETTER_AUTH_SECRET) management via .env
  - Password hashing (Better Auth default)
  - User data isolation enforced in all queries
  - Authentication failure logging
- **Compliance**: Security is foundational, not an afterthought

### ✅ Principle VIII: Type Safety & Error Handling
- **Status**: PASS
- **Evidence**:
  - Frontend: TypeScript strict mode, interfaces for all API responses
  - Backend: Python type hints, Pydantic models, HTTPException for errors
  - Error messages are user-friendly ("Invalid email or password" vs stack traces)
- **Compliance**: Type safety and error handling across full stack

**Constitution Check Result**: ✅ ALL GATES PASSED - Proceeding to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/features/authentication/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (PENDING)
├── data-model.md        # Phase 1 output (PENDING)
├── quickstart.md        # Phase 1 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
│   ├── auth-signup.md
│   ├── auth-login.md
│   ├── auth-logout.md
│   └── auth-verify.md
└── tasks.md             # Phase 2 output - created by /sp.tasks (NOT by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

frontend/
├── CLAUDE.md                    # Next.js patterns and Better Auth guidance
├── src/
│   ├── app/                     # Next.js 16+ App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   └── dashboard/           # Protected routes
│   │       └── page.tsx
│   ├── components/              # Reusable React components
│   │   ├── auth/
│   │   │   ├── SignupForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── LogoutButton.tsx
│   │   └── ui/                  # Generic UI components
│   ├── lib/                     # Utilities and configs
│   │   ├── auth.ts              # Better Auth configuration
│   │   ├── api-client.ts        # Centralized API client with JWT
│   │   └── types.ts             # TypeScript interfaces
│   └── middleware.ts            # Next.js middleware for protected routes
├── public/
├── .env.local                   # BETTER_AUTH_SECRET, API_URL
├── package.json
├── tsconfig.json
└── tailwind.config.js

backend/
├── CLAUDE.md                    # FastAPI patterns and JWT verification
├── src/
│   ├── main.py                  # FastAPI app entry point
│   ├── models.py                # SQLModel database models (User)
│   ├── routes/
│   │   └── auth.py              # Authentication endpoints
│   ├── services/
│   │   └── auth_service.py      # Authentication business logic
│   ├── middleware/
│   │   └── jwt_middleware.py    # JWT verification middleware
│   ├── db.py                    # Database connection and session
│   └── config.py                # Configuration from environment variables
├── tests/
│   ├── contract/                # API contract tests
│   └── integration/             # Integration tests
├── .env                         # BETTER_AUTH_SECRET, DATABASE_URL
├── requirements.txt
└── pyproject.toml

# Shared specifications
specs/
├── features/
│   └── authentication/          # This feature
├── api/
│   └── auth-endpoints.md        # REST API documentation
├── database/
│   └── users-schema.md          # User table schema
└── ui/
    └── auth-components.md       # Authentication UI components

# Root configuration
.spec-kit/
└── config.yaml                  # Spec-Kit Plus configuration

CLAUDE.md                        # Root Claude Code instructions
docker-compose.yml               # Development environment setup
README.md                        # Project documentation
```

**Structure Decision**: Using **Option 2: Web application** with separate `frontend/` and `backend/` directories. This aligns with Constitution Principle II (Monorepo Architecture) and enables clear separation between Next.js frontend and FastAPI backend while maintaining single-context development.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - all constitution checks passed. No complexity justifications needed.

---

## Phase 0: Research (COMPLETE)

**Status**: ✅ COMPLETE
**Output**: [`research.md`](./research.md)

### Research Findings Summary

1. **Better Auth + JWT Plugin**: Confirmed as primary authentication library with JWT token generation
2. **PyJWT Middleware**: FastAPI middleware pattern for centralized JWT verification
3. **Better Auth Schema Management**: Let Better Auth manage users table in Neon PostgreSQL
4. **HTTP-only Cookies**: Most secure token storage (primary) with localStorage fallback
5. **CORS Configuration**: Specific origins with credentials enabled for cookie-based auth

All technical decisions documented with rationale, alternatives considered, and security implications.

---

## Phase 1: Design (COMPLETE)

**Status**: ✅ COMPLETE
**Outputs**:
- [`data-model.md`](./data-model.md) - User and JWT Token entities
- [`contracts/auth-contracts.md`](./contracts/auth-contracts.md) - API endpoint specifications
- [`quickstart.md`](./quickstart.md) - Setup and testing guide

### Design Artifacts Summary

**Data Model**:
- User entity (PostgreSQL table managed by Better Auth)
- JWT Token structure (ephemeral, client-side storage)
- Data isolation strategy via user_id filtering

**API Contracts**:
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - Authentication and JWT issuance
- POST `/api/auth/logout` - Session termination
- GET `/api/auth/verify` - Token validation

**Quickstart Guide**:
- Environment setup instructions
- Manual testing procedures
- Common issues and solutions
- File location reference

---

## Post-Design Constitution Re-Check

*GATE: Re-evaluate constitution compliance after design phase*

### ✅ All Principles Still Compliant

- **Spec-Driven Development**: All design artifacts traceable to spec
- **Monorepo Architecture**: Frontend/backend structure maintained
- **Layered CLAUDE.md**: Will be created during implementation
- **Spec-Kit Plus Organization**: Files in correct locations
- **Technology Stack**: No deviations from required stack
- **RESTful API Design**: All endpoints follow REST conventions
- **Security First**: JWT, HTTPS, password hashing, user isolation all designed in
- **Type Safety**: TypeScript interfaces and Python type hints documented

**Re-Check Result**: ✅ NO NEW VIOLATIONS - Design maintains constitution compliance

---

## Implementation Readiness

✅ **Specification**: Complete (`spec.md`)
✅ **Research**: Complete (`research.md`)
✅ **Data Model**: Complete (`data-model.md`)
✅ **API Contracts**: Complete (`contracts/auth-contracts.md`)
✅ **Quickstart Guide**: Complete (`quickstart.md`)

**Next Command**: `/sp.tasks` - Generate implementation task breakdown

**Ready for Implementation**: YES

---

## Architectural Decision Record (ADR) Recommendation

📋 **Architectural decision detected**: Better Auth + JWT for stateless authentication in monorepo architecture

**Significance Test**:
- ✅ **Impact**: Long-term authentication strategy affects all future features
- ✅ **Alternatives**: Considered NextAuth.js, Auth0, custom JWT - chose Better Auth
- ✅ **Scope**: Cross-cutting concern affecting frontend, backend, and database

**Recommendation**: Document reasoning and tradeoffs?
Run `/sp.adr better-auth-jwt-authentication-strategy`

---

**Plan Status**: ✅ COMPLETE - Ready for task generation
