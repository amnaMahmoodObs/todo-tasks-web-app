# Todo App Overview

## Purpose
A todo application that evolves from console app to AI chatbot through multiple phases.

## Current Phase
Phase II: Full-Stack Web Application with Authentication

## Tech Stack
- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS, React 19
- **Backend**: FastAPI, SQLModel (ORM), Python 3.13+
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth with JWT
- **Development**: Spec-Kit Plus (spec-driven development)

## Architecture
- **Monorepo**: Frontend and backend in single repository
- **RESTful API**: 6 endpoints for task CRUD operations
- **Stateless Auth**: JWT tokens with multi-layer user isolation
- **Type Safety**: TypeScript (frontend) + Pydantic (backend)

## Features

### ✅ Completed
- [x] Phase I: Console app with in-memory storage
- [x] User authentication (signup, login, JWT verification)
- [x] Project setup and monorepo structure
- [x] Database schema and models (User)

### 🚧 In Progress
- [ ] Task CRUD operations (spec and plan complete)
  - [ ] Create task with title and optional description
  - [ ] View all user tasks
  - [ ] Update task details
  - [ ] Toggle task completion status
  - [ ] Delete task permanently
  - [ ] User data isolation (multi-layer security)

### 📋 Planned (Future Phases)
- [ ] Task filtering (complete/incomplete)
- [ ] Task sorting (date, title, status)
- [ ] Task search (by title/description)
- [ ] Phase III: AI chatbot interface
- [ ] Phase IV: Advanced features (collaboration, notifications)
- [ ] Phase V: Production deployment

## Project Organization

```
/specs
├── overview.md           # This file
├── features/             # Feature specifications
│   └── task-management/  # Task CRUD spec, plan, contracts
├── api/                  # API endpoint specs (future)
├── database/             # Schema specs (future)
└── ui/                   # Component specs (future)

/frontend                 # Next.js 16 application
/backend                  # FastAPI application
/.specify                 # Spec-Kit Plus templates
/history                  # PHRs and ADRs
```

## Development Status

**Current Branch**: `002-task-management`

**Latest Milestone**: Implementation planning complete for task management feature
- ✅ Specification written (20 functional requirements)
- ✅ Technical research completed
- ✅ Data model designed (Task entity with 7 fields)
- ✅ API contracts defined (OpenAPI 3.0 spec)
- ✅ Implementation plan created
- ⏭️ Next: Task breakdown (`/sp.tasks`) and implementation

## Success Criteria (Phase II)

- Users can create, read, update, and delete tasks
- Tasks persist across sessions in PostgreSQL
- Multi-user support with complete data isolation
- Authentication via Better Auth with JWT
- Performance: <2s task operations, <1s list rendering
- Security: 100% user isolation, no cross-user access

## Quick Start

```bash
# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (http://localhost:8000)
cd backend && uvicorn src.main:app --reload

# Both services
docker-compose up
```

## Documentation

- **Root CLAUDE.md**: Project overview and development workflow
- **Frontend CLAUDE.md**: Next.js patterns and component structure
- **Backend CLAUDE.md**: FastAPI patterns and API conventions
- **Constitution**: `.specify/memory/constitution.md` (project principles)
- **Feature Specs**: `specs/features/<feature-name>/spec.md`

---

**Last Updated**: 2026-01-30
**Phase**: II (Full-Stack Web Application)
**Status**: Planning → Implementation
