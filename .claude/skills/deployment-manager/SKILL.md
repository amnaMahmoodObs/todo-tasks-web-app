---
name: deployment-manager
description: "Deploy full-stack applications to Vercel (frontend) and Render (backend) with environment validation and configuration setup"
disable-model-invocation: false
allowed-tools: ["read", "write", "glob", "grep", "bash"]
---

# Deployment Manager Skill

Automates deployment of full-stack Next.js + FastAPI applications to Vercel (frontend) and Render (backend). Validates environment variables, generates configuration files, runs pre-deployment checks, and provides step-by-step deployment instructions with verification tests.

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
