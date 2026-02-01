---
name: deployment-manager
description: "Deploy full-stack applications to Vercel (frontend) and Railway/Render (backend) with environment validation and configuration setup. Includes lessons learned from real deployments to prevent common pitfalls."
disable-model-invocation: false
allowed-tools: ["read", "write", "glob", "grep", "bash"]
---

# Deployment Manager Skill

Automates deployment of full-stack Next.js + FastAPI applications to Vercel (frontend) and Railway/Render (backend). Validates environment variables, generates configuration files, runs pre-deployment checks, provides step-by-step deployment instructions with verification tests, and warns about common pitfalls discovered from real deployment experience.

## When to Use This Skill

Invoke this skill when:
- Ready to deploy the application to production
- Setting up deployment for the first time
- Need to validate deployment configuration
- Updating environment variables for production
- Troubleshooting deployment issues
- Want to verify deployment readiness before pushing
- Need to generate deployment config files (vercel.json, render.yaml)

**Example inputs:**
```
Deploy the app to Vercel and Render
Set up deployment configuration
Validate deployment environment variables
Generate deployment configs for production
Check if app is ready for deployment
Deploy frontend to Vercel and backend to Render
```

## Input Format

User will provide:
1. **Deployment action**: What to do
   - `validate` - Check deployment readiness
   - `setup` - Generate config files and setup instructions
   - `deploy` - Full deployment walkthrough
   - `verify` - Post-deployment verification

2. **Environment (optional)**: Target environment
   - `production` (default)
   - `staging`
   - `preview`

3. **Scope (optional)**: What to deploy
   - `frontend` - Only Vercel
   - `backend` - Only Render
   - `both` (default) - Full stack

**Example inputs:**
```
Deploy to production
Set up deployment for staging
Validate frontend deployment config
Deploy backend to Render
```

## Deployment Process

### Step 1: Pre-Deployment Validation

Run comprehensive checks before deployment:

#### A. Project Structure Validation
- [ ] Frontend directory exists (`./frontend`)
- [ ] Backend directory exists (`./backend`)
- [ ] Frontend has `package.json`
- [ ] Frontend has `next.config.ts` or `next.config.js`
- [ ] Backend has `requirements.txt` or `pyproject.toml`
- [ ] Backend has `src/main.py` (FastAPI app entry point)

#### B. Environment Variables Check

**Frontend Required Variables:**
```bash
# .env.local or Vercel dashboard
BETTER_AUTH_SECRET=            # Must match backend
DATABASE_URL=                  # Neon PostgreSQL
NEXT_PUBLIC_API_URL=           # Backend URL (after backend deployed)
```

**Backend Required Variables:**
```bash
# .env or Render dashboard
BETTER_AUTH_SECRET=            # Must match frontend
DATABASE_URL=                  # Neon PostgreSQL
FRONTEND_URL=                  # Vercel URL (after frontend deployed)
PYTHONPATH=src
PORT=8000                      # For Render
```

**Validation Steps:**
- [ ] Check if `.env.local` exists in frontend (for reference)
- [ ] Check if `.env` exists in backend (for reference)
- [ ] Verify `BETTER_AUTH_SECRET` is at least 32 characters
- [ ] Verify `DATABASE_URL` follows PostgreSQL connection string format
- [ ] Warn if `NEXT_PUBLIC_API_URL` or `FRONTEND_URL` are localhost (production should use deployed URLs)
- [ ] Check `.env.example` files exist for documentation

#### C. Build Validation

**Frontend Build Check:**
```bash
cd frontend
npm install
npm run build
```

- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors (if configured)
- [ ] `.next` directory created
- [ ] Check bundle size warnings

**Backend Validation:**
```bash
cd backend
pip install -r requirements.txt  # or uv sync
python -c "from src.main import app; print('✅ FastAPI app loads successfully')"
```

- [ ] Dependencies install without errors
- [ ] FastAPI app imports successfully
- [ ] No Python syntax errors
- [ ] All required modules available

#### D. Database Connection Test

```bash
# Test database connection
python -c "
from sqlmodel import create_engine
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    print('✅ Database connection successful')
"
```

- [ ] Database connection successful
- [ ] Database is accessible from deployment environment
- [ ] Database has required tables (run migrations if needed)

#### E. Git Repository Check

- [ ] Code is committed to git
- [ ] Repository pushed to GitHub/GitLab
- [ ] Working directory is clean (no uncommitted changes)
- [ ] On correct branch (main/master for production)

### Step 2: Generate Deployment Configuration Files

#### A. Frontend: Vercel Configuration

Create `frontend/vercel.json` (if not exists):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "env": {
    "BETTER_AUTH_SECRET": "@better-auth-secret",
    "DATABASE_URL": "@database-url"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": ""
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Notes:**
- Environment variables with `@` prefix reference Vercel secrets
- `NEXT_PUBLIC_API_URL` will be set after backend is deployed

#### B. Backend: Render Configuration

Create `backend/render.yaml`:

```yaml
services:
  - type: web
    name: todo-api
    runtime: python
    plan: free
    region: oregon
    branch: main
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.13"
      - key: PYTHONPATH
        value: src
      - key: BETTER_AUTH_SECRET
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: FRONTEND_URL
        sync: false
    healthCheckPath: /
    autoDeploy: true
```

**Alternative: Using pyproject.toml**

If using `pyproject.toml` with `uv`, create `backend/requirements.txt`:
```bash
cd backend
uv pip compile pyproject.toml -o requirements.txt
```

#### C. Environment Variable Documentation

Create `deployment-env-template.md`:

```markdown
# Deployment Environment Variables

## Frontend (Vercel)

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `BETTER_AUTH_SECRET` | `<your-32-char-secret>` | Production |
| `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` | Production |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Production |

## Backend (Render)

Add these in Render Dashboard → Web Service → Environment:

| Variable | Value |
|----------|-------|
| `BETTER_AUTH_SECRET` | `<same-as-frontend>` |
| `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `PYTHONPATH` | `src` |

## CRITICAL
- `BETTER_AUTH_SECRET` must be identical in frontend and backend
- Generate secret: `openssl rand -base64 32`
```

### Step 3: Deploy Backend First (Render)

**Why backend first?** Frontend needs `NEXT_PUBLIC_API_URL` which requires backend to be deployed.

#### Deploy Steps:

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select repository

3. **Configure Service**
   - **Name**: `todo-api` (or custom name)
   - **Region**: Oregon (or closest)
   - **Branch**: `main`
   - **Root Directory**: `backend` (if monorepo)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. **Add Environment Variables**
   Copy from `.env` and add in Render dashboard:
   ```
   BETTER_AUTH_SECRET=<your-secret>
   DATABASE_URL=<neon-postgres-url>
   FRONTEND_URL=https://your-app.vercel.app
   PYTHONPATH=src
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (~2-5 minutes)
   - Copy the deployed URL (e.g., `https://todo-api.onrender.com`)

6. **Verify Backend Deployment**
   ```bash
   # Test health endpoint
   curl https://todo-api.onrender.com/

   # Test API endpoint (if public)
   curl https://todo-api.onrender.com/api/health
   ```

### Step 4: Deploy Frontend (Vercel)

#### Deploy Steps:

1. **Create Vercel Account**
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:

   **Production Environment:**
   ```
   BETTER_AUTH_SECRET=<same-as-backend>
   DATABASE_URL=<neon-postgres-url>
   NEXT_PUBLIC_API_URL=https://todo-api.onrender.com
   ```

   **Important**: `NEXT_PUBLIC_API_URL` should be the Render backend URL from Step 3

5. **Deploy**
   - Click "Deploy"
   - Wait for build (~1-3 minutes)
   - Copy the deployed URL (e.g., `https://your-app.vercel.app`)

6. **Update Backend CORS**
   - Go back to Render dashboard
   - Update `FRONTEND_URL` environment variable to Vercel URL
   - Trigger redeploy (Render → Manual Deploy)

### Step 5: Post-Deployment Verification

#### A. Test Full Authentication Flow

```bash
# Test signup
curl -X POST https://todo-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'

# Expected: 201 Created with user object
```

#### B. Test Frontend Access

1. Visit `https://your-app.vercel.app`
2. Navigate to signup page
3. Create a test account
4. Verify redirect to login
5. Log in with test account
6. Verify redirect to dashboard
7. Check browser DevTools → Network tab for API calls

#### C. Verify Environment Variables

**Frontend Check:**
```javascript
// In browser console on your Vercel site
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
// Should output: https://todo-api.onrender.com
```

**Backend Check:**
```bash
# Check backend logs in Render dashboard
# Should see successful startup:
# INFO: Started server process
# INFO: Application startup complete
```

#### D. Test CORS Configuration

```bash
# Test from browser or curl
curl -X OPTIONS https://todo-api.onrender.com/api/tasks \
  -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Should return CORS headers allowing your frontend origin
```

#### E. Database Connection Verification

**Check Neon Dashboard:**
- Navigate to Neon console
- Check "Connections" tab
- Verify connections from Render (backend) and Vercel (frontend via Better Auth)
- Monitor active connections

#### F. Performance Check

**Frontend (Vercel):**
- Check Vercel Dashboard → Deployment → Functions
- Verify edge functions deployed correctly
- Check for any build warnings

**Backend (Render):**
- ⚠️ **Free tier sleeps after 15 minutes of inactivity**
- First request after sleep: 30-60 seconds (cold start)
- Subsequent requests: <1 second

### Step 6: Generate Deployment Report

```markdown
# Deployment Report

**Generated**: <ISO timestamp>
**Environment**: Production
**Status**: ✅ SUCCESS | ⚠️ WARNINGS | ❌ FAILED

---

## Deployment URLs

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://todo-api.onrender.com
- **Database**: Neon PostgreSQL (host.neon.tech)

---

## Deployment Summary

### Frontend (Vercel)
- **Status**: ✅ Deployed
- **Build Time**: 2m 34s
- **Framework**: Next.js 16.1.5
- **Node Version**: 20.x
- **Environment Variables**: 3 configured

### Backend (Render)
- **Status**: ✅ Deployed
- **Build Time**: 3m 12s
- **Runtime**: Python 3.13
- **Service Type**: Web Service (Free)
- **Environment Variables**: 4 configured

### Database (Neon)
- **Status**: ✅ Connected
- **Active Connections**: 2
- **Plan**: Free tier

---

## Pre-Deployment Checks

- [✅] Frontend build successful
- [✅] Backend validation successful
- [✅] Database connection tested
- [✅] Environment variables validated
- [✅] Git repository clean and pushed
- [✅] Configuration files generated

---

## Post-Deployment Verification

- [✅] Frontend accessible at deployment URL
- [✅] Backend health check passing
- [✅] CORS configured correctly
- [✅] Authentication flow working
- [✅] Database queries executing
- [✅] Environment variables loaded correctly

---

## Known Limitations (Free Tier)

### Render Backend
- ⚠️ Service sleeps after 15 minutes of inactivity
- ⚠️ Cold start time: 30-60 seconds on first request
- ⚠️ 750 hours/month limit (sufficient for single app)

### Vercel Frontend
- ✅ No sleep/cold start issues
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments

### Neon Database
- ✅ 0.5GB storage
- ⚠️ 1 project on free tier
- ✅ Automatic scaling

---

## Next Steps

1. **Test the application thoroughly**
   - Create test account
   - Test all features
   - Verify data persistence

2. **Set up custom domain (optional)**
   - Vercel: Settings → Domains
   - Configure DNS records

3. **Monitor deployments**
   - Vercel: Dashboard → Deployments
   - Render: Dashboard → Logs

4. **Set up error tracking (recommended)**
   - Consider Sentry or LogRocket
   - Monitor production errors

5. **Configure CI/CD (optional)**
   - Auto-deploy on git push
   - Already enabled by default

---

## Environment Variable Checklist

### ✅ Verified Matches

- [✅] `BETTER_AUTH_SECRET` identical in frontend and backend
- [✅] `DATABASE_URL` accessible from both environments
- [✅] `NEXT_PUBLIC_API_URL` points to deployed backend
- [✅] `FRONTEND_URL` points to deployed frontend

---

## Troubleshooting Guide

### Issue: Frontend can't reach backend
**Symptoms**: CORS errors, network failures
**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel matches Render URL
2. Check CORS configuration in `backend/src/main.py`
3. Verify `FRONTEND_URL` in Render matches Vercel URL

### Issue: Authentication fails
**Symptoms**: "Invalid token" errors
**Solutions**:
1. Verify `BETTER_AUTH_SECRET` is identical in both environments
2. Check secret is at least 32 characters
3. Redeploy both frontend and backend after updating

### Issue: Database connection fails
**Symptoms**: "Database connection error"
**Solutions**:
1. Verify `DATABASE_URL` format is correct
2. Check Neon database is active (not paused)
3. Verify SSL mode is set: `?sslmode=require`

### Issue: Backend cold starts
**Symptoms**: First request takes 30-60 seconds
**Solutions**:
1. This is expected on Render free tier
2. Consider upgrading to paid plan ($7/month)
3. Or implement keep-alive ping service

---

## Rollback Instructions

### Rollback Frontend (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Rollback Backend (Render)
1. Go to Render Dashboard → Deploys
2. Find previous working deploy
3. Click "Redeploy" on that version

### Rollback Database (Neon)
1. Neon has automatic backups
2. Contact Neon support for point-in-time restore
3. Or restore from manual backup if configured

---

## Success Criteria Met

- [✅] Application accessible at public URLs
- [✅] Authentication working end-to-end
- [✅] Database operations successful
- [✅] No console errors in browser
- [✅] API responses under 2 seconds (warm)
- [✅] All environment variables configured correctly
```

---

## Railway Deployment (Alternative to Render)

Railway is an alternative backend deployment platform that's simpler than Render and better suited for Python/FastAPI applications. Use this section when deploying to Railway instead of Render.

### Why Choose Railway Over Render

**Advantages**:
- Simpler configuration (no YAML required)
- Better Python support out of the box
- Auto-detects runtime and dependencies
- Easier to configure environment variables
- Better free tier experience (though credit card required)

**Use Railway when**:
- User has a credit card (required even for free tier)
- Simpler setup is preferred
- No complex deployment configuration needed

**Use Render when**:
- No credit card available
- Need infrastructure-as-code (render.yaml)
- More control over deployment configuration

### Railway Deployment Process

#### Step 1: Pre-Deployment Validation (Same as Render)

Follow same validation steps as Render deployment (Project Structure, Environment Variables, Build Validation, Database Connection Test, Git Repository Check).

**CRITICAL CHECKS FOR RAILWAY**:

1. **Dependencies in Correct Location**
   ```bash
   # Check backend/pyproject.toml
   # Dependencies MUST be in [project.dependencies], NOT [tool.uv.dev-dependencies]

   grep -A 20 "\[project\]" backend/pyproject.toml | grep "dependencies ="
   ```

   **Common Mistake**: Dependencies in wrong section
   ```toml
   # ❌ WRONG - dev-dependencies won't be installed
   [tool.uv]
   dev-dependencies = [
       "fastapi>=0.128.0",
   ]

   # ✅ CORRECT
   [project]
   dependencies = [
       "fastapi[standard]>=0.128.0",
       "sqlmodel>=0.0.22",
       "pyjwt>=2.10.1",
       "python-dotenv>=1.0.1",
       "psycopg2-binary>=2.9.10",
       "uvicorn[standard]>=0.34.0",
       "bcrypt>=4.0.0",  # Don't forget this!
   ]
   ```

2. **All Imports Have Dependencies**
   ```bash
   # Find all imports in backend
   grep -rh "^import \|^from " backend/src/ | grep -v "__" | sort | uniq

   # Common missing dependency: bcrypt
   # If you see "import bcrypt" anywhere, ensure bcrypt>=4.0.0 is in requirements.txt
   ```

3. **Frontend lib/ Directory Not Blocked**
   ```bash
   # Check .gitignore doesn't block frontend/lib/
   grep "^lib/" .gitignore

   # If found, this is WRONG! It blocks frontend/lib/
   # Should be:
   # /lib/
   # /lib64/
   # backend/lib/
   # backend/lib64/
   ```

4. **TypeScript Errors Fixed**
   ```bash
   cd frontend
   npm run build

   # Common errors to watch for:
   # - React.Node → Should be React.ReactNode
   # - FormEvent without React. prefix → Use React.FormEvent
   # - Missing @types/pg → Run: npm install --save-dev @types/pg
   ```

5. **Auth Cookie Logic Present**
   ```bash
   # Check LoginForm sets client-side cookie for Next.js middleware
   grep "document.cookie.*auth_token" frontend/components/auth/LoginForm.tsx

   # Should contain:
   # document.cookie = `auth_token=${response.token}; path=/; expires=...`;
   ```

#### Step 2: Deploy Backend to Railway

**2.1 Create Railway Account**
1. Visit https://railway.app
2. Click "Sign up with GitHub"
3. Authorize Railway to access repositories
4. **Note**: Credit card required even for free tier (won't be charged)

**2.2 Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose repository
4. Railway auto-detects it's a Python project

**2.3 Configure Service Settings**

Navigate to Settings and configure:

| Setting | Value | Critical Notes |
|---------|-------|----------------|
| **Root Directory** | `backend` | If monorepo (both frontend/backend in one repo) |
| **Install Command** | `pip install -r requirements.txt` | Railway auto-detects this |
| **Build Command** | (leave empty) | Not needed for Python |
| **Start Command** | `uvicorn src.main:app --host 0.0.0.0 --port $PORT` | **MUST use $PORT variable!** |
| **Watch Paths** | `backend/**` | Only trigger rebuild on backend changes |

**🔥 CRITICAL: Start Command Must Use $PORT**

**❌ WRONG (causes 502 error)**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8080
```

**✅ CORRECT**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**Why**: Railway assigns a random port (e.g., 7976) via `$PORT` environment variable. If you hardcode 8080, Railway's proxy can't connect to your app → 502 error.

**2.4 Add Environment Variables**

Click "Variables" tab and add these (one at a time):

```bash
BETTER_AUTH_SECRET=<your-32-character-secret>
DATABASE_URL=postgresql://user:password@host.neon.tech/db?sslmode=require&channel_binding=require
FRONTEND_URL=https://your-app.vercel.app
PYTHONPATH=src
```

**🔥 CRITICAL RULES**:

1. **DO NOT manually set PORT variable** - Railway sets this automatically
2. **NO TRAILING SLASHES on URLs**:
   ```bash
   ❌ FRONTEND_URL=https://app.vercel.app/
   ✅ FRONTEND_URL=https://app.vercel.app
   ```
3. **BETTER_AUTH_SECRET must be minimum 32 characters**:
   ```bash
   # Generate with:
   openssl rand -base64 32
   ```
4. **DATABASE_URL must include SSL mode**:
   ```bash
   ?sslmode=require&channel_binding=require
   ```

**2.5 Deploy and Monitor**

1. Railway auto-deploys after configuration
2. Go to "Deployments" tab
3. Click on the active deployment
4. Click "Deploy Logs" (NOT Build Logs)
5. Watch for these success indicators:

```
✅ Dependencies installing (should see bcrypt, fastapi, etc.)
✅ Starting application...
✅ CORS configured for origins: ['http://localhost:3000', 'https://your-app.vercel.app']
✅ Database tables created/verified successfully
✅ Application startup complete
✅ Uvicorn running on http://0.0.0.0:XXXX
```

**🔥 CRITICAL: Check the Port Number**

If logs show:
```
INFO: Uvicorn running on http://0.0.0.0:8080
```
**This is WRONG!** Port should be dynamic (e.g., 7976, 3829, etc.).

If you see port 8080:
1. Your start command is hardcoded to port 8080
2. Go to Settings → Deploy → Start Command
3. Fix it to: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
4. Railway will auto-redeploy

**2.6 Enable Public Networking**

1. Go to Settings → Networking
2. Look for "Public Networking" section
3. If not enabled, click "Generate Domain"
4. Copy the URL (e.g., `https://todo-app-production.up.railway.app`)

**🚨 Save this URL! You need it for frontend deployment.**

**2.7 Verify Backend is Working**

```bash
# Test root endpoint
curl https://your-backend.railway.app/

# Should return:
# {"status":"ok","message":"Todo App API is running","version":"0.1.0"}

# Test health endpoint
curl https://your-backend.railway.app/health

# Should return:
# {"status":"healthy"}

# If you get 502 Bad Gateway:
# - Check deploy logs for port number
# - Verify start command uses $PORT
# - Check no manual PORT variable is set
```

#### Step 3: Deploy Frontend to Vercel (Same as Render)

Follow existing Vercel deployment steps with these Railway-specific notes:

**3.1 Environment Variable Changes**

In Vercel Settings → Environment Variables:

```bash
BETTER_AUTH_SECRET=<same-as-railway>  # MUST match exactly!
DATABASE_URL=<neon-postgres-url>
NEXT_PUBLIC_API_URL=https://your-backend.railway.app  # Railway URL, NO trailing slash!
```

**🔥 CRITICAL**: `BETTER_AUTH_SECRET` must be **character-for-character identical** in Railway and Vercel.

**3.2 Post-Frontend Deployment**

After frontend deploys, **immediately update Railway**:

1. Go to Railway Dashboard → Your backend service
2. Click "Variables" tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```bash
   FRONTEND_URL=https://your-app-xxxxx.vercel.app  # NO trailing slash!
   ```
4. Railway auto-redeploys (~1-2 minutes)
5. Wait for deploy to complete before testing

**Why**: Backend CORS must allow exact frontend origin.

#### Step 4: Railway-Specific Troubleshooting

**Issue 1: 502 Bad Gateway After Successful Deploy**

**Symptoms**:
- Deploy logs show "Uvicorn running on http://0.0.0.0:8080"
- Backend returns 502 when accessing URL
- No errors in deploy logs

**Root Cause**: Port mismatch - app listening on wrong port

**Fix**:
```bash
# Settings → Deploy → Start Command
uvicorn src.main:app --host 0.0.0.0 --port $PORT  # Use $PORT!

# Variables tab → Remove PORT if you added it manually
# Railway sets PORT automatically - DO NOT override it
```

**Issue 2: ModuleNotFoundError: No module named 'bcrypt'**

**Symptoms** (Railway logs):
```
ModuleNotFoundError: No module named 'bcrypt'
```

**Root Cause**: `bcrypt` used in code but not in `requirements.txt`

**Fix**:
```bash
# Add to backend/requirements.txt
bcrypt>=4.0.0

# Also check pyproject.toml has it in dependencies (not dev-dependencies)
```

**How to Find All Missing Dependencies**:
```bash
# Find all imports
cd backend
grep -rh "^import \|^from " src/ | \
  grep -v "^from \." | \
  grep -v "^from src" | \
  cut -d' ' -f2 | cut -d'.' -f1 | sort | uniq

# Check each against requirements.txt and standard library
```

**Issue 3: favicon.ico Causes 500 Error**

**Symptoms** (Railway logs):
```
INFO: GET /favicon.ico HTTP/1.1 500 Internal Server Error
fastapi.exceptions.HTTPException: 401: Authentication required
```

**Root Cause**: JWT middleware blocking static files

**Fix**:
```python
# backend/src/middleware/jwt_middleware.py

# Skip authentication for health/docs endpoints and static files
if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico"]:
    return await call_next(request)
```

**Issue 4: CORS Errors - Frontend Can't Reach Backend**

**Symptoms**:
```
Access to fetch at 'https://backend.railway.app/api/auth/login'
from origin 'https://app.vercel.app' has been blocked by CORS policy
```

**Root Cause**: `FRONTEND_URL` mismatch or trailing slash

**Fix**:
```bash
# Railway Variables tab
# Check FRONTEND_URL exactly matches Vercel URL

# ❌ WRONG
FRONTEND_URL=https://app.vercel.app/   # Trailing slash!
FRONTEND_URL=http://app.vercel.app     # Wrong protocol!
FRONTEND_URL=https://app.vercel.com    # Wrong domain!

# ✅ CORRECT
FRONTEND_URL=https://app.vercel.app
```

Also check backend code:
```python
# backend/src/main.py
allowed_origins = [
    "http://localhost:3000",
    settings.FRONTEND_URL,  # Should use env var, not hardcoded
]

# Logs should show (no trailing slash):
# CORS configured for origins: ['http://localhost:3000', 'https://app.vercel.app']
```

**Issue 5: Login Works But Dashboard Redirects to Login**

**Symptoms**:
- Login API call succeeds (200 OK)
- Token is returned in response
- Console shows "Redirecting to dashboard..."
- Network tab shows 307 Temporary Redirect
- Ends up back on login page

**Root Cause**: Next.js middleware can't access auth token

**Debug**:
```javascript
// In browser console after login:
console.log(localStorage.getItem('auth_token'));  // Should show token
console.log(document.cookie);  // Should show auth_token=...
```

**If localStorage has token but cookie doesn't exist**:

**Fix**: Update LoginForm to set client-side cookie:

```typescript
// frontend/components/auth/LoginForm.tsx

if (response.token) {
  // Store in localStorage
  localStorage.setItem("auth_token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));

  // ALSO set client-side cookie for Next.js middleware
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  document.cookie = `auth_token=${response.token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
}
```

**Why**: Next.js middleware runs server-side and can't access localStorage. Backend's HTTP-only cookie doesn't work cross-domain (Railway → Vercel). Solution: client-side cookie that both middleware and API client can access.

**Also update LogoutButton**:
```typescript
// frontend/components/auth/LogoutButton.tsx

// Clear auth_token cookie
document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
```

#### Railway Deployment Checklist

**Before Deploying to Railway**:
- [ ] All code committed and pushed to GitHub
- [ ] `backend/requirements.txt` exists and has ALL dependencies
  - [ ] Including `bcrypt>=4.0.0`
  - [ ] All imports have corresponding packages
- [ ] `backend/pyproject.toml` dependencies in `[project.dependencies]` not `[tool.uv.dev-dependencies]`
- [ ] Start command uses `$PORT`: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- [ ] Frontend builds locally: `cd frontend && npm run build`
- [ ] Backend starts locally: `cd backend && uvicorn src.main:app`

**Railway Configuration**:
- [ ] Root directory: `backend` (if monorepo)
- [ ] Start command uses `$PORT` variable
- [ ] Environment variables added:
  - [ ] `BETTER_AUTH_SECRET` (min 32 chars)
  - [ ] `DATABASE_URL` (with `?sslmode=require`)
  - [ ] `FRONTEND_URL` (NO trailing slash)
  - [ ] `PYTHONPATH=src`
- [ ] DO NOT set PORT manually
- [ ] Public networking enabled (domain generated)

**Verify Railway Deployment**:
- [ ] Deploy logs show correct port (not 8080)
- [ ] Deploy logs show "Uvicorn running on http://0.0.0.0:XXXX"
- [ ] Deploy logs show "Application startup complete"
- [ ] Deploy logs show CORS configured correctly
- [ ] Test endpoint: `curl https://your-backend.railway.app/` returns 200
- [ ] Test health: `curl https://your-backend.railway.app/health` returns healthy

**Before Testing End-to-End**:
- [ ] Updated Railway `FRONTEND_URL` with Vercel URL
- [ ] Waited for Railway to redeploy (~1-2 min)
- [ ] Cleared browser cookies and localStorage
- [ ] Checked browser console for errors
- [ ] Checked Network tab for CORS errors

---

## Common Pitfalls Prevention (All Platforms)

Based on real deployment experience, always check these common issues BEFORE deploying:

### Pitfall 1: .gitignore Blocking Frontend Files

**Check**:
```bash
# Is lib/ in your .gitignore?
grep "^lib/" .gitignore

# If yes, this blocks frontend/lib/ too!
```

**Fix**:
```gitignore
# ❌ WRONG - blocks everything named lib/
lib/

# ✅ CORRECT - only blocks Python lib directories
/lib/
/lib64/
backend/lib/
backend/lib64/
```

**Verify frontend/lib/ is tracked**:
```bash
git ls-files frontend/lib/
# Should list files like:
# frontend/lib/api-client.ts
# frontend/lib/auth.ts
# frontend/lib/types.ts
```

### Pitfall 2: TypeScript Build Errors

**Common Errors**:

1. **React.Node doesn't exist**:
   ```typescript
   // ❌ WRONG
   children: React.Node

   // ✅ CORRECT
   children: React.ReactNode
   ```

2. **FormEvent is deprecated**:
   ```typescript
   // ❌ WRONG
   import { FormEvent } from "react";
   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {}

   // ✅ CORRECT (no import needed)
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {}
   ```

3. **Missing type definitions**:
   ```bash
   # If using pg (PostgreSQL client)
   npm install --save-dev @types/pg
   ```

**Prevent**:
```bash
# Always run build before deploying
cd frontend
npm run build

# Fix all TypeScript errors before pushing
```

### Pitfall 3: Dependencies in Wrong Location

**Check backend/pyproject.toml**:
```toml
# ❌ WRONG - Railway won't install dev-dependencies
[tool.uv]
dev-dependencies = [
    "fastapi>=0.128.0",
]

# ✅ CORRECT
[project]
dependencies = [
    "fastapi[standard]>=0.128.0",
    "sqlmodel>=0.0.22",
    "pyjwt>=2.10.1",
    "python-dotenv>=1.0.1",
    "psycopg2-binary>=2.9.10",
    "uvicorn[standard]>=0.34.0",
    "bcrypt>=4.0.0",
]
```

**Generate requirements.txt**:
```bash
cd backend
uv pip compile pyproject.toml -o requirements.txt
# OR
pip-compile pyproject.toml -o requirements.txt
```

### Pitfall 4: Missing bcrypt Dependency

**Check if bcrypt is used**:
```bash
grep -r "import bcrypt" backend/src/
```

**If found, ensure it's in requirements.txt**:
```bash
grep "bcrypt" backend/requirements.txt
# Should show: bcrypt>=4.0.0
```

### Pitfall 5: Trailing Slashes in URLs

**Always check environment variables**:
```bash
# ❌ WRONG
FRONTEND_URL=https://app.vercel.app/
NEXT_PUBLIC_API_URL=https://api.railway.app/

# ✅ CORRECT
FRONTEND_URL=https://app.vercel.app
NEXT_PUBLIC_API_URL=https://api.railway.app
```

**CORS issues caused by trailing slashes**:
- Frontend makes request to: `https://api.railway.app`
- Backend expects: `https://app.vercel.app/`
- Origins don't match → CORS error

### Pitfall 6: JWT Secret Mismatch

**Verify secrets match**:
```bash
# Get from Vercel
# Dashboard → Settings → Environment Variables → BETTER_AUTH_SECRET

# Get from Railway/Render
# Variables tab → BETTER_AUTH_SECRET

# Compare character-by-character
# Must be EXACTLY the same
```

**Generate new secret**:
```bash
# Minimum 32 characters
openssl rand -base64 32

# Example output:
# k0RNnOkDbIJEQSdmv4bSj1Kzbv70TaBg1fG0C1H743Y=
```

### Pitfall 7: Forgetting to Update CORS After Frontend Deploy

**After deploying frontend to Vercel**:

1. Get Vercel URL (e.g., `https://your-app-abc123.vercel.app`)
2. Update backend environment variable:
   - Railway: Variables tab → `FRONTEND_URL`
   - Render: Environment tab → `FRONTEND_URL`
3. Wait for backend to redeploy (1-2 minutes)
4. **Don't skip this!** Backend won't accept frontend requests until CORS is updated

### Pitfall 8: Testing Without Clearing Browser Data

**Before testing deployed app**:
```javascript
// Open browser DevTools (F12)
// Console tab, run:
localStorage.clear();
sessionStorage.clear();
// Application tab → Clear all cookies
```

**Why**: Old tokens/cookies from localhost will cause auth failures on production.

### Pitfall 9: PORT Variable Configuration

**Railway/Render**:
- ✅ Use `$PORT` in start command
- ❌ Don't set PORT environment variable manually
- Platform sets it automatically

**Start command must be**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**NOT**:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8080  # Hardcoded!
```

### Pitfall 10: Authentication Middleware Too Strict

**Middleware must allow**:
- Public routes: `/api/auth/signup`, `/api/auth/login`
- Health checks: `/`, `/health`
- Docs: `/docs`, `/redoc`, `/openapi.json`
- Static files: `/favicon.ico`
- OPTIONS requests (CORS preflight)

```python
# backend/src/middleware/jwt_middleware.py

async def dispatch(self, request: Request, call_next):
    # Skip OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        return await call_next(request)

    # Skip public routes
    public_routes = [
        "/api/auth/signup",
        "/api/auth/login",
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/favicon.ico",
    ]
    if request.url.path in public_routes:
        return await call_next(request)

    # ... verify JWT for protected routes
```

---

## Output Format

Always return a structured deployment report:

```markdown
# Deployment Status Report

**Action**: <validate|setup|deploy|verify>
**Environment**: <production|staging>
**Timestamp**: <ISO date>
**Overall Status**: ✅ READY | ⚠️ WARNINGS | ❌ NOT READY

---

## Summary

<Brief overview of deployment status>

---

## Pre-Deployment Validation

### Project Structure
- [✅/❌] Frontend exists
- [✅/❌] Backend exists
- [✅/❌] Configuration files present

### Environment Variables
- [✅/❌] Frontend variables validated
- [✅/❌] Backend variables validated
- [✅/❌] Secrets match between environments

### Build Tests
- [✅/❌] Frontend builds successfully
- [✅/❌] Backend starts successfully
- [✅/❌] Database connection works

### Git Status
- [✅/❌] Changes committed
- [✅/❌] Pushed to remote
- [✅/❌] On correct branch

---

## Configuration Files

### Generated/Updated Files:
1. `frontend/vercel.json` - Vercel configuration
2. `backend/render.yaml` - Render configuration
3. `deployment-env-template.md` - Environment variable reference

---

## Deployment Instructions

<Step-by-step instructions based on action requested>

---

## Critical Issues ❌

<List any blocking issues that must be fixed before deployment>

---

## Warnings ⚠️

<List any non-blocking issues or recommendations>

---

## Next Steps

1. <Action 1>
2. <Action 2>
3. <Action 3>
```

## Error Handling

### Missing Frontend Directory
```
❌ Error: Frontend directory not found

Expected location: ./frontend

Please ensure you are running this command from the project root directory.
```

### Missing Backend Directory
```
❌ Error: Backend directory not found

Expected location: ./backend

Please ensure you are running this command from the project root directory.
```

### Environment Variables Missing
```
⚠️ Warning: Environment variables not configured

Missing variables:
Frontend:
  - BETTER_AUTH_SECRET
  - DATABASE_URL

Backend:
  - BETTER_AUTH_SECRET
  - DATABASE_URL
  - FRONTEND_URL

Create .env.local (frontend) and .env (backend) with these variables.
See deployment-env-template.md for details.
```

### Build Failures
```
❌ Error: Frontend build failed

Build output:
<error messages>

Please fix build errors before deploying.
Common issues:
- TypeScript errors
- Missing dependencies
- Invalid environment variables
```

### Database Connection Failed
```
❌ Error: Cannot connect to database

Database URL: postgresql://***@***.neon.tech/***

Possible causes:
1. Database URL is incorrect
2. Database is paused (Neon free tier)
3. Network access restricted
4. SSL mode not set (?sslmode=require)

Please verify DATABASE_URL in .env file.
```

## Quality Assurance Checklist

Before returning deployment report:
- [ ] All pre-deployment checks completed
- [ ] Environment variables validated
- [ ] Configuration files generated if needed
- [ ] Build tests passed (or failures documented)
- [ ] Clear next steps provided
- [ ] Deployment URLs included (if deployed)
- [ ] Troubleshooting guide included
- [ ] Rollback instructions provided
- [ ] Success criteria clearly stated
- [ ] Any warnings or errors prominently displayed

## Special Features

### A. Interactive Deployment Mode

If user requests full deployment walkthrough, guide them step-by-step:

1. Run pre-deployment validation
2. Wait for user confirmation
3. Generate config files
4. Guide through backend deployment
5. Wait for backend URL from user
6. Guide through frontend deployment
7. Run post-deployment verification
8. Generate final report

### B. Environment Sync

When updating environment variables:
1. Read current variables from both environments
2. Compare for mismatches (especially `BETTER_AUTH_SECRET`)
3. Generate update instructions
4. Warn about required redeploys

### C. Health Monitoring

Generate a health check script for post-deployment:

```bash
#!/bin/bash
# health-check.sh

echo "🔍 Checking deployment health..."

FRONTEND_URL="https://your-app.vercel.app"
BACKEND_URL="https://todo-api.onrender.com"

# Check frontend
echo "Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ $FRONTEND_STATUS -eq 200 ]; then
  echo "✅ Frontend is up (HTTP $FRONTEND_STATUS)"
else
  echo "❌ Frontend is down (HTTP $FRONTEND_STATUS)"
fi

# Check backend
echo "Testing backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)
if [ $BACKEND_STATUS -eq 200 ] || [ $BACKEND_STATUS -eq 404 ]; then
  echo "✅ Backend is up (HTTP $BACKEND_STATUS)"
else
  echo "❌ Backend is down (HTTP $BACKEND_STATUS)"
fi

# Check database connectivity via API
echo "Testing database connection..."
API_HEALTH=$(curl -s "$BACKEND_URL/api/health" | jq -r '.status' 2>/dev/null)
if [ "$API_HEALTH" = "healthy" ]; then
  echo "✅ Database connected"
else
  echo "⚠️  Database status unknown"
fi

echo ""
echo "Health check complete!"
```

## Notes

- **Deployment order matters**: Always deploy backend before frontend (frontend needs backend URL)
- **Environment variable sync**: `BETTER_AUTH_SECRET` must be identical in both environments
- **Free tier limitations**: Render backend sleeps after 15 minutes; cold start takes 30-60 seconds
- **Configuration files**: Generated files should be committed to git for reproducibility
- **Database migrations**: Run migrations before deploying if schema changed
- **CORS configuration**: Must include exact Vercel URL in backend allowed origins
- **Security headers**: Vercel configuration includes recommended security headers
- **Monitoring**: Both platforms provide built-in logging and monitoring dashboards
