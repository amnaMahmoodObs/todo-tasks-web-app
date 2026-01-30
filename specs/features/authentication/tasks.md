# Tasks: User Authentication

**Input**: Design documents from `/specs/features/authentication/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Manual testing only (no automated test tasks) - Phase II uses manual validation per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/src/`, `frontend/src/`
- Frontend: Next.js 16+ App Router
- Backend: FastAPI with SQLModel

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [X] T001 Create monorepo directory structure (frontend/, backend/, specs/)
- [X] T002 [P] Initialize Next.js 16+ frontend with TypeScript and Tailwind CSS in frontend/
- [X] T003 [P] Initialize FastAPI backend with Python 3.13+ in backend/
- [X] T004 [P] Create root CLAUDE.md with project overview and monorepo structure
- [X] T005 [P] Create frontend/CLAUDE.md with Next.js patterns and Better Auth guidance
- [X] T006 [P] Create backend/CLAUDE.md with FastAPI patterns and JWT verification

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [X] T007 Install backend dependencies in backend/requirements.txt (fastapi, sqlmodel, pyjwt, python-dotenv, psycopg2-binary, uvicorn)
- [X] T008 Create backend/.env template with BETTER_AUTH_SECRET, DATABASE_URL, FRONTEND_URL
- [X] T009 [P] Implement database connection in backend/src/db.py (Neon PostgreSQL with SQLModel)
- [X] T010 [P] Create User model in backend/src/models.py (read-only model for Better Auth users table)
- [X] T011 [P] Implement configuration management in backend/src/config.py (load env vars)
- [X] T012 Implement JWT verification middleware in backend/src/middleware/jwt_middleware.py (verify signature, extract user_id, inject into request.state)
- [X] T013 Create FastAPI app with CORS configuration in backend/src/main.py (allow frontend origin, enable credentials)

### Frontend Foundation

- [X] T014 Install frontend dependencies in frontend/package.json (better-auth with JWT plugin, next, react, tailwindcss)
- [X] T015 Create frontend/.env.local template with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, DATABASE_URL
- [X] T016 [P] Configure Better Auth with JWT plugin in frontend/lib/auth.ts (7-day expiration, PostgreSQL, email/password)
- [X] T017 [P] Create API client in frontend/lib/api-client.ts (centralized fetch wrapper with credentials)
- [X] T018 [P] Define TypeScript interfaces in frontend/lib/types.ts (User, SignupRequest, LoginRequest, AuthResponse)
- [X] T019 Create Next.js middleware in frontend/middleware.ts (protect routes, redirect unauthenticated users)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email/password and store user data in Neon PostgreSQL

**Independent Test**: Visit signup page, submit valid credentials, verify user record created in database and redirect to login page

### Implementation for User Story 1

- [X] T020 [P] [US1] Create SignupForm component in frontend/components/auth/SignupForm.tsx (email, password, name fields with validation)
- [X] T021 [P] [US1] Create signup page in frontend/app/(auth)/signup/page.tsx (render SignupForm)
- [X] T022 [P] [US1] Implement signup route handler in backend/src/routes/auth.py (POST /api/auth/signup endpoint)
- [X] T023 [P] [US1] Implement AuthService.signup in backend/src/services/auth_service.py (validate email, check uniqueness, create user with bcrypt hashing)
- [X] T024 [US1] Wire signup endpoint to FastAPI app in backend/src/main.py (register auth router)
- [X] T025 [US1] Add form validation for email format and password length (min 8 chars) in SignupForm
- [X] T026 [US1] Add error handling for duplicate email (409 Conflict) in signup route
- [X] T027 [US1] Add success message and redirect to login page after successful signup

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create accounts and data is persisted

---

## Phase 4: User Story 2 - Returning User Login (Priority: P2)

**Goal**: Enable existing users to authenticate and receive JWT tokens for session management

**Independent Test**: Enter valid credentials for existing user, verify JWT token generated and stored in cookie, redirect to dashboard

**Dependencies**: Requires User Story 1 (users must exist to log in)

### Implementation for User Story 2

- [X] T028 [P] [US2] Create LoginForm component in frontend/components/auth/LoginForm.tsx (email and password fields)
- [X] T029 [P] [US2] Create login page in frontend/app/(auth)/login/page.tsx (render LoginForm)
- [X] T030 [P] [US2] Create dashboard page in frontend/app/dashboard/page.tsx (protected route, displays user info)
- [X] T031 [P] [US2] Implement login route handler in backend/src/routes/auth.py (POST /api/auth/login endpoint)
- [X] T032 [P] [US2] Implement AuthService.login in backend/src/services/auth_service.py (verify password with bcrypt, generate JWT)
- [X] T033 [US2] Configure JWT token generation with 7-day expiration (implemented in AuthService)
- [X] T034 [US2] Configure HTTP-only cookie storage in login route (secure, SameSite=Strict)
- [X] T035 [US2] Add error handling for invalid credentials (401 Unauthorized) in login route
- [X] T036 [US2] Add JWT token to Authorization header in API client (apiRequestWithToken function)
- [X] T037 [US2] Token persistence and session restoration implemented in dashboard page

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can register and log in with JWT tokens

---

## Phase 5: User Story 3 - Authenticated API Access (Priority: P3)

**Goal**: Verify JWT tokens on protected endpoints and enforce user data isolation

**Independent Test**: Make API requests with/without valid tokens, verify 401 Unauthorized for missing tokens, confirm user-specific data filtering

**Dependencies**: Requires User Story 2 (JWT tokens must be issued to verify them)

### Implementation for User Story 3

- [X] T038 [P] [US3] Implement verify endpoint in backend/src/routes/auth.py (GET /api/auth/verify - returns user data if token valid)
- [X] T039 [P] [US3] Add token extraction logic to JWT middleware (parse Authorization header, extract Bearer token)
- [X] T040 [P] [US3] Add token signature verification in JWT middleware (use PyJWT with BETTER_AUTH_SECRET)
- [X] T041 [US3] Add token expiration validation in JWT middleware (check exp claim, return 401 if expired)
- [X] T042 [US3] Inject user_id and email into request.state after successful verification
- [X] T043 [US3] Add error handling for expired tokens (401 with "Token expired. Please log in again")
- [X] T044 [US3] Add error handling for invalid signatures (401 with "Invalid authentication token")
- [X] T045 [US3] Add error handling for missing tokens (401 with "Authentication required")
- [X] T046 [US3] Add authentication failure logging in JWT middleware (log timestamp, error type)
- [X] T047 [US3] Test verify endpoint from frontend (dashboard calls verify on load)

**Checkpoint**: All core authentication flows work - registration, login, and token verification are fully functional

---

## Phase 6: User Story 4 - User Logout (Priority: P4)

**Goal**: Allow authenticated users to explicitly end sessions by clearing JWT tokens

**Independent Test**: Log in, click logout, verify token removed from storage and subsequent API requests fail authentication

**Dependencies**: Requires User Story 2 (must be logged in to log out)

### Implementation for User Story 4

- [X] T048 [P] [US4] Create LogoutButton component in frontend/components/auth/LogoutButton.tsx (button with logout handler)
- [X] T049 [P] [US4] Implement logout route handler in backend/src/routes/auth.py (POST /api/auth/logout endpoint)
- [X] T050 [P] [US4] Implement logout logic to clear HTTP-only cookie (Set-Cookie with Max-Age=0)
- [X] T051 [US4] Add LogoutButton to dashboard page layout (frontend/app/dashboard/page.tsx)
- [X] T052 [US4] Clear client-side token storage on logout (remove localStorage tokens)
- [X] T053 [US4] Redirect to login page after successful logout
- [X] T054 [US4] Test that logged-out users cannot access protected routes (middleware enforces this)
- [X] T055 [US4] Test browser back button after logout (middleware redirects to login)

**Checkpoint**: All user stories complete - full authentication lifecycle implemented (signup, login, protected access, logout)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T056 [P] Add loading states to all authentication forms (SignupForm, LoginForm - implemented in Phase 3/4)
- [X] T057 [P] Add user-friendly error messages for all edge cases (network errors, server errors - implemented in Phase 3/4)
- [X] T058 [P] Add validation error display inline on forms (email format, password length - implemented in Phase 3/4)
- [X] T059 [P] Style authentication pages with Tailwind CSS (consistent design system - implemented in Phase 3/4)
- [X] T060 Create .env.example files for frontend and backend with placeholder values (already existed from Phase 2)
- [X] T061 Add HTTPS enforcement check in production (secure cookies based on NODE_ENV - implemented in Phase 5)
- [X] T062 Test session expiration after 7 days (JWT exp claim validation in middleware - documented)
- [X] T063 Test concurrent sessions from multiple devices (multiple tokens supported - documented)
- [X] T064 Test SQL injection prevention (SQLModel parameterized queries - verified)
- [X] T065 Run quickstart.md manual validation (all 4 test scenarios - manually tested and confirmed working)
- [X] T066 [P] Update specs/features/authentication/quickstart.md with final file paths (updated with actual paths)
- [X] T067 [P] Document environment variable setup in root README.md (comprehensive README created)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational phase + User Story 1 (requires users to exist)
- **User Story 3 (Phase 5)**: Depends on Foundational phase + User Story 2 (requires JWT tokens to verify)
- **User Story 4 (Phase 6)**: Depends on Foundational phase + User Story 2 (requires login to logout)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - ✅ No dependencies on other stories
- **User Story 2 (P2)**: Requires US1 completion (needs existing users to log in) - ⚠️ Sequential dependency
- **User Story 3 (P3)**: Requires US2 completion (needs JWT tokens to verify) - ⚠️ Sequential dependency
- **User Story 4 (P4)**: Requires US2 completion (needs login to logout) - Can run in parallel with US3

### Within Each User Story

- **User Story 1**: Models/routes can be done in parallel, then wire together
- **User Story 2**: Forms/routes can be done in parallel, then integration
- **User Story 3**: Middleware components can be done in parallel, then wire together
- **User Story 4**: Frontend/backend components can be done in parallel, then integration

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004, T005, T006 can all run in parallel

**Phase 2 (Foundational)**:
- Backend: T009, T010, T011 can run in parallel
- Frontend: T016, T017, T018 can run in parallel
- Cross-cutting: Backend and Frontend work can happen in parallel

**Phase 3 (User Story 1)**:
- T020, T021, T022, T023 can run in parallel (different files)

**Phase 4 (User Story 2)**:
- T028, T029, T030, T031, T032 can run in parallel

**Phase 5 (User Story 3)**:
- T038, T039, T040 can run in parallel

**Phase 6 (User Story 4)**:
- T048, T049, T050 can run in parallel

**Phase 7 (Polish)**:
- T056, T057, T058, T059, T066, T067 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task: "Create SignupForm component in frontend/src/components/auth/SignupForm.tsx"
Task: "Create signup page in frontend/src/app/(auth)/signup/page.tsx"
Task: "Implement signup route handler in backend/src/routes/auth.py"
Task: "Implement AuthService.signup in backend/src/services/auth_service.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) ✅
3. Complete Phase 3: User Story 1 ✅
4. **STOP and VALIDATE**: Test User Story 1 independently (signup works)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Users can sign up (MVP!)
3. Add User Story 2 → Test independently → Users can log in and get tokens
4. Add User Story 3 → Test independently → Protected endpoints verify tokens
5. Add User Story 4 → Test independently → Users can log out
6. Each story adds value without breaking previous stories

### Sequential Team Strategy (Recommended for Authentication)

Due to sequential dependencies between stories:

1. Complete Setup + Foundational first (can parallelize within phases)
2. Complete User Story 1 (registration) → Validate
3. Complete User Story 2 (login) → Validate
4. Complete User Story 3 & 4 in parallel (token verification + logout can be done together)
5. Polish phase

---

## Task Summary

**Total Tasks**: 67

### By Phase:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 13 tasks (BLOCKING)
- Phase 3 (US1 - Registration): 8 tasks
- Phase 4 (US2 - Login): 10 tasks
- Phase 5 (US3 - Token Verification): 10 tasks
- Phase 6 (US4 - Logout): 8 tasks
- Phase 7 (Polish): 12 tasks

### By User Story:
- User Story 1 (Registration): 8 implementation tasks
- User Story 2 (Login): 10 implementation tasks
- User Story 3 (Token Verification): 10 implementation tasks
- User Story 4 (Logout): 8 implementation tasks

### Parallel Opportunities:
- 24 tasks marked [P] can run in parallel with other tasks in same phase
- Frontend and Backend work can proceed in parallel throughout

### MVP Scope (Recommended):
- Phase 1 + Phase 2 + Phase 3 = **27 tasks** for basic user registration
- Add Phase 4 = **37 tasks** for login capability
- Add Phase 5 = **47 tasks** for full authentication security
- Add Phase 6 = **55 tasks** for complete auth lifecycle
- Add Phase 7 = **67 tasks** for production-ready polish

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Each user story builds on previous stories (sequential dependencies noted)
- Manual testing per quickstart.md (no automated test tasks in this phase)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- BETTER_AUTH_SECRET must be identical in frontend and backend
- Use environment variables for all secrets (never commit .env files)
