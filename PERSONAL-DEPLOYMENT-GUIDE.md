# Personal Deployment Guide - Vercel + Railway
## Lessons Learned from Real Deployment Experience

**Created**: 2026-02-01
**Purpose**: Personal reference guide for deploying Next.js + FastAPI to Vercel (frontend) + Railway (backend)
**Note**: This file is for personal learning and can be removed from the project after reading

---

## Table of Contents
1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Post-Deployment Troubleshooting](#post-deployment-troubleshooting)
6. [Configuration Reference](#configuration-reference)

---

## Overview

### Why This Order Matters
**CRITICAL**: Always deploy backend FIRST, then frontend.

**Reason**: Frontend needs `NEXT_PUBLIC_API_URL` which requires the backend to be deployed and have a URL.

### Platform Choices
- **Frontend**: Vercel (Next.js optimized, auto-deploys from Git)
- **Backend**: Railway (Python-friendly, simple setup, auto-deploys from Git)
- **Database**: Neon PostgreSQL (serverless, free tier available)

---

## Pre-Deployment Checklist

### ✅ Before You Start

#### 1. Git Repository Status
```bash
# Check status
git status

# All changes should be committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Why**: Both Vercel and Railway deploy from Git. Uncommitted code won't be deployed.

#### 2. Environment Files Exist (Locally)
- ✅ `frontend/.env.local` exists
- ✅ `backend/.env` exists

**Note**: These files are NOT deployed (.gitignore blocks them). You'll add variables manually in dashboards.

#### 3. Dependencies Are Correct

**Frontend:**
```bash
cd frontend
npm install
npm run build  # Must succeed!
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# OR
uv sync
```

**CRITICAL ISSUE WE HIT**: Dependencies were in `dev-dependencies` instead of `dependencies` in `pyproject.toml`

**Fix**:
```toml
# backend/pyproject.toml
[project]
dependencies = [  # NOT dev-dependencies!
    "fastapi[standard]>=0.128.0",
    "sqlmodel>=0.0.22",
    "pyjwt>=2.10.1",
    "python-dotenv>=1.0.1",
    "psycopg2-binary>=2.9.10",
    "uvicorn[standard]>=0.34.0",
    "bcrypt>=4.0.0",  # Don't forget this!
]
```

#### 4. Backend Requirements.txt is Current
If using `pyproject.toml`, generate `requirements.txt`:
```bash
cd backend
uv pip compile pyproject.toml -o requirements.txt
# OR
pip-compile pyproject.toml -o requirements.txt
```

**Why**: Railway uses `requirements.txt`, not `pyproject.toml` directly.

---

## Common Pitfalls & Solutions

### 🔥 Issue 1: Frontend Build Fails on Vercel

**Symptoms**:
```
Module not found: Can't resolve '@/lib/api-client'
Type error: Cannot find name 'FormEvent'
Type error: Namespace 'React' has no exported member 'Node'
```

**Root Cause**: `.gitignore` was blocking `frontend/lib/` directory

**Our .gitignore had**:
```
lib/  # This blocks Python AND frontend lib!
```

**Fix**:
```gitignore
# Only block Python lib directories
/lib/
/lib64/
backend/lib/
backend/lib64/
# Don't block frontend/lib/
```

**Also Fixed TypeScript Errors**:
```typescript
// WRONG
children: React.Node

// CORRECT
children: React.ReactNode

// WRONG
import { FormEvent } from "react"
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

// CORRECT (no import needed)
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
```

**Missing TypeScript Definitions**:
```bash
npm install --save-dev @types/pg
```

---

### 🔥 Issue 2: Backend Crashes on Railway - Missing Dependencies

**Symptoms** (Railway logs):
```
ModuleNotFoundError: No module named 'bcrypt'
```

**Root Cause**: `bcrypt` was used in code but not in `requirements.txt`

**Fix**:
```txt
# backend/requirements.txt
bcrypt>=4.0.0  # Add this!
```

**How to Find Missing Dependencies**:
```bash
# Search for all imports in backend
grep -r "^import\|^from" backend/src/ | grep -v "__" | sort | uniq

# Check each against requirements.txt
```

---

### 🔥 Issue 3: Railway 502 Error - Port Mismatch

**Symptoms**:
- Backend deploys successfully (logs show "Uvicorn running")
- But API returns 502 Bad Gateway
- Logs show: `Uvicorn running on http://0.0.0.0:8080`
- But Railway expects port 7976 (or whatever PORT env var is)

**Root Cause**: Start command not using `$PORT` variable correctly

**WRONG Start Command**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8080
```

**CORRECT Start Command**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**Railway Configuration**:
- **DO NOT** manually set PORT environment variable
- Railway sets it automatically
- Your start command MUST use `$PORT`

---

### 🔥 Issue 4: CORS Errors - Frontend Can't Reach Backend

**Symptoms**:
```
Access to fetch at 'https://backend.railway.app/api/auth/login'
from origin 'https://app.vercel.app' has been blocked by CORS policy
```

**Root Cause**: `FRONTEND_URL` had trailing slash or was wrong

**WRONG**:
```python
# backend/src/main.py
allowed_origins = [
    "http://localhost:3000",
    "https://todo-app.vercel.app/",  # TRAILING SLASH!
]
```

**CORRECT**:
```python
allowed_origins = [
    "http://localhost:3000",
    settings.FRONTEND_URL,  # No trailing slash
]
```

**Railway Environment Variable**:
```
FRONTEND_URL=https://todo-app.vercel.app
```
**NO TRAILING SLASH!**

---

### 🔥 Issue 5: Login Works But Dashboard Redirects Back to Login

**Symptoms**:
- Login API call succeeds (200 OK)
- Token is returned
- Console shows "Redirecting to dashboard..."
- But you end up back on login page (307 Temporary Redirect)

**Root Cause**: Next.js middleware couldn't read auth token

**The Problem**:
```typescript
// frontend/middleware.ts
const authToken = req.cookies.get("auth_token")?.value;
```

Middleware runs **server-side** and can't access `localStorage`. Backend was setting HTTP-only cookie, but cross-domain cookies don't work (Railway → Vercel).

**Solution**: Set a **client-side cookie** after login:

```typescript
// frontend/components/auth/LoginForm.tsx
if (response.token) {
  // Store in localStorage (for API requests)
  localStorage.setItem("auth_token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));

  // ALSO set cookie (for Next.js middleware)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  document.cookie = `auth_token=${response.token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
}
```

**Why This Works**:
- Middleware (server) reads the cookie
- API client (browser) reads localStorage
- Both have access to the token

---

### 🔥 Issue 6: Favicon.ico Causes 500 Error

**Symptoms** (Railway logs):
```
INFO: GET /favicon.ico HTTP/1.1 500 Internal Server Error
Exception: fastapi.exceptions.HTTPException: 401: Authentication required
```

**Root Cause**: JWT middleware was blocking `/favicon.ico`

**Fix**:
```python
# backend/src/middleware/jwt_middleware.py
# Skip authentication for health/docs endpoints and static files
if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico"]:
    return await call_next(request)
```

**Lesson**: Always allow static files and favicons through middleware!

---

## Step-by-Step Deployment

### Phase 1: Deploy Backend to Railway

#### Step 1.1: Create Railway Account
1. Go to https://railway.app
2. Click "Sign up with GitHub"
3. Authorize Railway to access your repositories

**Why GitHub**: Auto-deploy on every git push!

#### Step 1.2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `your-username/todo-tasks-web-app`

#### Step 1.3: Configure Service
**CRITICAL SETTINGS**:

| Setting | Value | Notes |
|---------|-------|-------|
| **Root Directory** | `backend` | If monorepo |
| **Install Command** | `pip install -r requirements.txt` | Railway auto-detects |
| **Build Command** | (leave empty) | Not needed for Python |
| **Start Command** | `uvicorn src.main:app --host 0.0.0.0 --port $PORT` | **MUST use $PORT** |
| **Watch Paths** | `backend/**` | Only redeploy on backend changes |

**DO NOT SET**:
- ❌ PORT variable (Railway sets this automatically)

#### Step 1.4: Add Environment Variables

Click "Variables" tab, add these:

```
BETTER_AUTH_SECRET=k0RNnOkDbIJEQSdmv4bSj1Kzbv70TaBg1fG0C1H743Y=
DATABASE_URL=postgresql://user:password@host.neon.tech/db?sslmode=require&channel_binding=require
FRONTEND_URL=https://todo-app.vercel.app
PYTHONPATH=src
```

**CRITICAL**:
- Generate `BETTER_AUTH_SECRET` with: `openssl rand -base64 32` (min 32 chars)
- Get `DATABASE_URL` from Neon dashboard
- `FRONTEND_URL`: Use your Vercel URL (we'll get this in Phase 2)
  - For now, use a placeholder: `https://todo-app.vercel.app`
  - We'll update it after frontend deploys

**NO TRAILING SLASHES ON URLS!**

#### Step 1.5: Deploy
1. Railway auto-deploys after configuration
2. Wait 2-3 minutes
3. Watch "Deployments" tab for logs

**Check Deploy Logs For**:
```
✅ Dependencies installing
✅ Starting application...
✅ CORS configured for origins
✅ Database tables created/verified successfully
✅ Application startup complete
✅ Uvicorn running on http://0.0.0.0:XXXX
```

**If you see port 8080 instead of $PORT**: Your start command is wrong!

#### Step 1.6: Get Backend URL
1. Go to "Settings" → "Networking"
2. Look for "Public Networking" section
3. Copy the URL (e.g., `https://todo-tasks-web-app-production.up.railway.app`)

**Save this URL! You'll need it for frontend.**

#### Step 1.7: Test Backend
```bash
# Test root endpoint
curl https://your-backend.railway.app/

# Should return:
# {"status":"ok","message":"Todo App API is running","version":"0.1.0"}

# Test health endpoint
curl https://your-backend.railway.app/health

# Should return:
# {"status":"healthy"}
```

---

### Phase 2: Deploy Frontend to Vercel

#### Step 2.1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign up with GitHub"
3. Authorize Vercel to access repositories

#### Step 2.2: Import Project
1. Click "Add New..." → "Project"
2. Find your repository: `your-username/todo-tasks-web-app`
3. Click "Import"

#### Step 2.3: Configure Project
**CRITICAL SETTINGS**:

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework Preset** | Next.js | Auto-detected |
| **Root Directory** | `frontend` | If monorepo |
| **Build Command** | `npm run build` | Default |
| **Output Directory** | `.next` | Default |
| **Install Command** | `npm install` | Default |

#### Step 2.4: Add Environment Variables

Click "Environment Variables" before deploying:

```
BETTER_AUTH_SECRET=k0RNnOkDbIJEQSdmv4bSj1Kzbv70TaBg1fG0C1H743Y=
DATABASE_URL=postgresql://user:password@host.neon.tech/db?sslmode=require&channel_binding=require
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**CRITICAL**:
- `BETTER_AUTH_SECRET`: **MUST MATCH BACKEND EXACTLY**
- `NEXT_PUBLIC_API_URL`: Use the Railway URL from Phase 1, Step 1.6
- **NO TRAILING SLASH!**

**Apply to**:
- ✅ Production
- ✅ Preview
- ✅ Development

#### Step 2.5: Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Watch build logs

**Check Build Logs For**:
```
✅ Installing dependencies
✅ Building Next.js application
✅ Compiling TypeScript
✅ Build completed successfully
```

#### Step 2.6: Get Frontend URL
After deployment:
1. Vercel shows you the URL (e.g., `https://todo-app-xxxxx.vercel.app`)
2. Click on it to verify it loads
3. Copy this URL

#### Step 2.7: Update Backend CORS
**IMPORTANT**: Now that you have the Vercel URL, update Railway:

1. Go back to Railway dashboard
2. Click your backend service
3. Go to "Variables" tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://todo-app-xxxxx.vercel.app
   ```
5. Railway will auto-redeploy (wait 1-2 minutes)

**Why**: Backend needs to allow your frontend domain in CORS.

---

### Phase 3: Test End-to-End

#### Step 3.1: Clear Browser Data
**CRITICAL**: Clear old data before testing!

1. Open DevTools (F12)
2. Application tab → Clear all cookies
3. Application tab → Clear local storage
4. Refresh page

#### Step 3.2: Test Signup
1. Visit `https://your-app.vercel.app/signup`
2. Create test account:
   - Email: `test@example.com`
   - Password: `testpass123`
   - Name: `Test User`
3. Should redirect to `/login`

**If signup fails**:
- Check Network tab → POST `/api/auth/signup`
- Look for CORS errors (means `FRONTEND_URL` is wrong)
- Look for 401 errors (means JWT secret mismatch)

#### Step 3.3: Test Login
1. Visit `/login`
2. Enter credentials from signup
3. Click "Login"
4. Should redirect to `/dashboard`

**If redirects back to login**:
- Check console for errors
- Check Application → Cookies → Is `auth_token` cookie set?
- If NO cookie: Check `LoginForm.tsx` has cookie-setting code
- If YES cookie but still redirects: Check middleware.ts

#### Step 3.4: Test Dashboard
1. Should see your name/email
2. Try creating a task
3. Task should appear in list
4. Try marking task complete
5. Try deleting task

**Check Network Tab**:
- All API calls should show 200 OK
- No CORS errors
- `Authorization: Bearer <token>` header should be present

---

## Post-Deployment Troubleshooting

### Issue: "Network Error" When Calling API

**Debug Steps**:
1. Open Network tab
2. Look at failed request
3. Check the URL - is it correct?
4. Check CORS headers in response
5. Look at browser console for CORS errors

**Common Causes**:
- `NEXT_PUBLIC_API_URL` is wrong or missing
- Backend `FRONTEND_URL` doesn't match actual frontend URL
- Trailing slash in URLs

**Fix**:
```bash
# Verify frontend env var
# In Vercel dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # No trailing slash!

# Verify backend env var
# In Railway dashboard → Variables
FRONTEND_URL=https://your-frontend.vercel.app  # No trailing slash!
```

### Issue: Backend Returns 401 "Invalid token"

**Cause**: JWT secret mismatch

**Fix**:
```bash
# Check both environments have EXACT same secret

# Vercel:
BETTER_AUTH_SECRET=k0RNnOkDbIJEQSdmv4bSj1Kzbv70TaBg1fG0C1H743Y=

# Railway:
BETTER_AUTH_SECRET=k0RNnOkDbIJEQSdmv4bSj1Kzbv70TaBg1fG0C1H743Y=

# They must match character-for-character!
```

### Issue: Database Connection Fails

**Symptoms** (Railway logs):
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Fix**:
1. Check `DATABASE_URL` has `?sslmode=require` at the end
2. Check Neon database is active (not paused)
3. Test connection locally first

```bash
# Test connection
python -c "
from sqlmodel import create_engine
engine = create_engine('your-database-url')
with engine.connect() as conn:
    print('✅ Connected')
"
```

### Issue: Railway App Returns 502 After Successful Deploy

**Check**:
1. Railway logs show "Uvicorn running" message?
2. What port is it running on?

**If logs show**:
```
INFO: Uvicorn running on http://0.0.0.0:8080
```

**That's wrong! Should be dynamic port.**

**Fix start command**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**NOT**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8080  # WRONG!
```

---

## Configuration Reference

### Railway Environment Variables (Backend)

```bash
# Required
BETTER_AUTH_SECRET=<min-32-char-secret>
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
FRONTEND_URL=https://your-app.vercel.app
PYTHONPATH=src

# Optional (Railway sets these automatically)
# PORT=<do-not-set-manually>
```

### Vercel Environment Variables (Frontend)

```bash
# Required
BETTER_AUTH_SECRET=<same-as-backend>
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Optional
NODE_ENV=production  # Vercel sets this
```

### Railway Service Settings

```json
{
  "rootDirectory": "backend",
  "installCommand": "pip install -r requirements.txt",
  "buildCommand": "",
  "startCommand": "uvicorn src.main:app --host 0.0.0.0 --port $PORT",
  "watchPaths": ["backend/**"]
}
```

### Vercel Project Settings

```json
{
  "framework": "nextjs",
  "rootDirectory": "frontend",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

---

## Quick Reference

### ✅ Deployment Checklist

**Before Deploying**:
- [ ] All code committed and pushed to GitHub
- [ ] `frontend/lib/` directory is tracked in git
- [ ] `backend/requirements.txt` has ALL dependencies (including `bcrypt`)
- [ ] `pyproject.toml` dependencies are in `dependencies` (not `dev-dependencies`)
- [ ] Frontend builds locally: `cd frontend && npm run build`
- [ ] Backend starts locally: `cd backend && uvicorn src.main:app`
- [ ] Database connection works locally

**Backend Deployment** (Railway):
- [ ] Root directory: `backend`
- [ ] Start command uses `$PORT`: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- [ ] DO NOT manually set PORT variable
- [ ] `FRONTEND_URL` has no trailing slash
- [ ] `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] Test backend URL after deploy: `curl https://your-backend.railway.app/`

**Frontend Deployment** (Vercel):
- [ ] Root directory: `frontend`
- [ ] `NEXT_PUBLIC_API_URL` points to Railway backend
- [ ] `NEXT_PUBLIC_API_URL` has no trailing slash
- [ ] `BETTER_AUTH_SECRET` matches backend exactly
- [ ] Update backend `FRONTEND_URL` with Vercel URL after deploy
- [ ] Test frontend loads: visit Vercel URL

**Post-Deployment**:
- [ ] Clear browser cookies/localStorage
- [ ] Test signup → login → dashboard flow
- [ ] No CORS errors in console
- [ ] No 401 errors
- [ ] Tasks can be created/updated/deleted

### 🚫 Never Do This

1. ❌ Set `PORT` manually in Railway (let Railway set it)
2. ❌ Put trailing slashes in URLs (`https://app.com/` ← WRONG)
3. ❌ Different `BETTER_AUTH_SECRET` in frontend/backend
4. ❌ Forget to update backend `FRONTEND_URL` after deploying frontend
5. ❌ Put dependencies in `dev-dependencies` instead of `dependencies`
6. ❌ Forget to add `bcrypt` to requirements.txt
7. ❌ Use hardcoded port `8080` in start command (use `$PORT`)
8. ❌ Block `frontend/lib/` in `.gitignore`
9. ❌ Deploy frontend before backend (you need backend URL first)

### ✅ Always Do This

1. ✅ Deploy backend FIRST (Railway)
2. ✅ Get Railway URL
3. ✅ Deploy frontend SECOND (Vercel) with backend URL
4. ✅ Get Vercel URL
5. ✅ Update backend `FRONTEND_URL` with Vercel URL
6. ✅ Wait for Railway to redeploy (~1-2 min)
7. ✅ Test end-to-end
8. ✅ Clear browser data before testing
9. ✅ Check Network tab for CORS/401 errors
10. ✅ Keep secrets in sync between platforms

---

## Lessons Learned Summary

### Code Issues
1. **TypeScript errors**: `React.Node` → `React.ReactNode`
2. **Missing imports**: `@types/pg` for PostgreSQL types
3. **Deprecated imports**: Use `React.FormEvent` not `FormEvent`
4. **Missing dependencies**: `bcrypt` wasn't in `requirements.txt`
5. **Wrong dependency location**: Must be in `dependencies` not `dev-dependencies`

### Configuration Issues
1. **Gitignore blocking files**: `lib/` blocked `frontend/lib/` - be specific!
2. **Port mismatch**: Must use `$PORT` not hardcoded `8080`
3. **Trailing slashes**: URLs must NOT have trailing slashes
4. **CORS origins**: Must match exact frontend URL
5. **JWT middleware**: Must allow `/favicon.ico` and other static files

### Authentication Issues
1. **Cookie vs localStorage**: Middleware needs cookies, API needs localStorage
2. **Cross-domain cookies**: HTTP-only cookies don't work cross-domain
3. **Solution**: Set client-side cookie after login for middleware to read

### Deployment Order
1. Backend first (Railway) → get URL
2. Frontend second (Vercel) → use backend URL
3. Update backend CORS → use frontend URL
4. Test end-to-end

---

**Final Advice**: When in doubt, check the logs!
- **Vercel**: Deployments tab → Click deployment → View logs
- **Railway**: Deployments tab → Click deployment → View deploy logs
- **Browser**: F12 → Console + Network tabs

Good luck with future deployments! 🚀
