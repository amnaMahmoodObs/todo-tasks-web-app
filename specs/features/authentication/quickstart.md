# Quickstart: User Authentication

**Feature**: Authentication
**Date**: 2026-01-28
**Purpose**: Quick reference for implementing and testing authentication feature

---

## Setup

### 1. Environment Variables

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-here
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**Backend** (`.env`):
```bash
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-here
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
FRONTEND_URL=http://localhost:3000
```

**CRITICAL**: Use the same `BETTER_AUTH_SECRET` in both frontend and backend!

### 2. Install Dependencies

**Frontend**:
```bash
cd frontend
npm install better-auth next@latest react react-dom tailwindcss
```

**Backend**:
```bash
cd backend
pip install fastapi sqlmodel pyjwt python-dotenv psycopg2-binary
```

### 3. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

---

## Manual Testing

### Test 1: User Signup

1. Navigate to `http://localhost:3000/signup`
2. Enter:
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)
   - Name: `Test User` (optional)
3. Click "Sign Up"
4. **Expected**: Redirect to login page with success message

**Verify in Database**:
```sql
SELECT id, email, name, created_at FROM users WHERE email = 'test@example.com';
```

### Test 2: User Login

1. Navigate to `http://localhost:3000/login`
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Log In"
4. **Expected**: Redirect to dashboard, JWT token stored in cookie

**Verify Token (Browser DevTools)**:
- Open DevTools → Application → Cookies
- Look for `auth_token` with HttpOnly flag

### Test 3: Authenticated API Request

1. While logged in, open browser console
2. Run:
```javascript
fetch('http://localhost:8000/api/auth/verify', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```
3. **Expected**: Returns user object with `valid: true`

### Test 4: User Logout

1. Click "Logout" button
2. **Expected**: Redirect to login page, cookie cleared
3. Try accessing dashboard
4. **Expected**: Redirect to login (not authenticated)

---

## Quick Commands

### Check Backend Health
```bash
curl http://localhost:8000/health
```

### Test Signup (curl)
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123","name":"Test"}'
```

### Test Login (curl)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}' \
  -c cookies.txt
```

### Test Authenticated Request (curl)
```bash
curl http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer <paste-jwt-token-here>"
```

---

## Common Issues

### Issue: "BETTER_AUTH_SECRET not found"
**Solution**: Ensure `.env` files exist and contain the secret. Restart servers after adding env vars.

### Issue: "CORS error"
**Solution**: Check `FRONTEND_URL` in backend `.env` matches your frontend URL exactly (including port).

### Issue: "Token verification failed"
**Solution**: Ensure `BETTER_AUTH_SECRET` is identical in both frontend and backend.

### Issue: "Database connection failed"
**Solution**: Verify `DATABASE_URL` format and Neon PostgreSQL connection string.

---

## File Locations

### Frontend
- Better Auth config: `frontend/lib/auth.ts`
- Signup page: `frontend/app/(auth)/signup/page.tsx`
- Login page: `frontend/app/(auth)/login/page.tsx`
- Dashboard page: `frontend/app/dashboard/page.tsx`
- API client: `frontend/lib/api-client.ts`
- Type definitions: `frontend/lib/types.ts`
- SignupForm component: `frontend/components/auth/SignupForm.tsx`
- LoginForm component: `frontend/components/auth/LoginForm.tsx`
- LogoutButton component: `frontend/components/auth/LogoutButton.tsx`
- Middleware: `frontend/middleware.ts`

### Backend
- Auth routes: `backend/src/routes/auth.py`
- Auth service: `backend/src/services/auth_service.py`
- JWT middleware: `backend/src/middleware/jwt_middleware.py`
- User model: `backend/src/models.py`
- Database connection: `backend/src/db.py`
- Configuration: `backend/src/config.py`
- Main app: `backend/src/main.py`

---

## Next Steps

1. ✅ Specification complete (`spec.md`)
2. ✅ Research complete (`research.md`)
3. ✅ Data model complete (`data-model.md`)
4. ✅ API contracts complete (`contracts/auth-contracts.md`)
5. ✅ Quickstart complete (`quickstart.md`)
6. **NEXT**: Run `/sp.tasks` to generate implementation tasks
7. **THEN**: Run `/sp.implement` to generate code

---

**Quickstart Status**: ✅ COMPLETE
