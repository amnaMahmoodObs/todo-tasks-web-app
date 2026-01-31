/**
 * Better Auth configuration for Next.js App Router.
 *
 * This module configures Better Auth with:
 * - PostgreSQL database connection (Neon)
 * - Email/password authentication
 * - JWT plugin with 7-day expiration
 * - HTTP-only secure cookies
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long");
}

export const auth = betterAuth({
  // PostgreSQL database configuration
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase II: no email verification
    minPasswordLength: 8,
  },

  // Session configuration with secure cookies
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    },
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // CSRF protection
  },

  // Base URL for the application
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",

  // Secret for JWT signing (must match backend)
  secret: process.env.BETTER_AUTH_SECRET,
});
