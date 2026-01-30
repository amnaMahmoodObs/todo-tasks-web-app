# Frontend Development Guide - Next.js 16 + Better Auth

This file provides context and guidance for developing the Next.js 16 frontend with Better Auth authentication.

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth with JWT plugin
- **Database**: Neon PostgreSQL (managed by Better Auth)
- **State Management**: React hooks and Server Components

## Project Structure

```
frontend/
├── app/                      # Next.js 16 App Router
│   ├── (auth)/              # Auth route group (signup, login)
│   │   ├── signup/page.tsx
│   │   └── login/page.tsx
│   ├── dashboard/           # Protected routes
│   │   └── page.tsx
│   ├── api/                 # API routes
│   │   └── auth/[...all]/route.ts  # Better Auth handler
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── LogoutButton.tsx
│   └── ui/                  # Generic UI components
├── lib/                     # Utilities and configs
│   ├── auth.ts              # Better Auth configuration
│   ├── api-client.ts        # Centralized API client
│   └── types.ts             # TypeScript interfaces
├── middleware.ts            # Route protection middleware
└── .env.local               # Environment variables
```

## Better Auth Configuration

Better Auth is configured in `lib/auth.ts` with the following settings:

- **JWT Plugin**: Enabled with 7-day token expiration
- **Database**: PostgreSQL connection (Neon)
- **Email/Password**: Enabled with minimum 8-character passwords
- **Cookie Settings**: HTTP-only, secure (production), SameSite=Strict

### Example Configuration

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    },
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  }
});
```

## Protected Routes

Use Next.js middleware in `middleware.ts` to protect routes:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);

  // Check session cookie
  const session = req.cookies.get('session')?.value;

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

## API Client

Centralized API client in `lib/api-client.ts` handles authenticated requests:

```typescript
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Send cookies with request
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

## TypeScript Types

Define all API types in `lib/types.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-here
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Node Environment
NODE_ENV=development
```

**CRITICAL**: The `BETTER_AUTH_SECRET` must be identical in both frontend and backend!

## Form Validation

All authentication forms should include client-side validation:

- **Email**: Valid format check (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **Password**: Minimum 8 characters
- **Error Display**: Show user-friendly error messages inline

## Component Patterns

### Authentication Forms

```typescript
'use client';

import { useState } from 'react';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Signup failed');
        return;
      }

      // Redirect on success
      window.location.href = '/login';
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Testing Strategy

For Phase II, manual testing is used (no automated tests). Follow `quickstart.md` for testing procedures:

1. Visit signup page and create account
2. Verify redirect to login
3. Log in with created account
4. Verify JWT cookie is set
5. Access protected dashboard
6. Log out and verify cookie is cleared

## Security Best Practices

- ✅ Use HTTP-only cookies for JWT storage (XSS protection)
- ✅ Set `SameSite=Strict` on cookies (CSRF protection)
- ✅ Enable `secure` flag in production (HTTPS only)
- ✅ Validate all user input on client and server
- ✅ Never log sensitive data (passwords, tokens)
- ✅ Use environment variables for secrets

## Common Issues

### "CORS error when calling backend"
**Solution**: Ensure `NEXT_PUBLIC_API_URL` matches the backend's allowed origins in CORS config.

### "Token verification failed"
**Solution**: Verify `BETTER_AUTH_SECRET` is identical in frontend and backend `.env` files.

### "Session not persisting across page refreshes"
**Solution**: Check that cookies are being set with the correct domain and path settings.

## Next Steps

After authentication is complete:
1. Integrate task CRUD operations
2. Add user-specific data filtering
3. Implement error boundaries for better UX
4. Add loading states and optimistic UI updates
