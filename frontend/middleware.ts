/**
 * Next.js middleware for route protection and authentication checks.
 *
 * This middleware intercepts requests and:
 * - Redirects unauthenticated users trying to access protected routes to login
 * - Redirects authenticated users trying to access public routes to dashboard
 * - Performs optimistic authentication checks based on session cookies
 */

import { NextRequest, NextResponse } from "next/server";

// Define protected and public routes
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/"];

/**
 * Middleware function to handle authentication routing.
 *
 * @param req - Incoming Next.js request
 * @returns Next.js response (redirect or continue)
 */
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Check for auth token cookie (set by backend)
  const authToken = req.cookies.get("auth_token")?.value;
  const hasSession = Boolean(authToken);

  // Redirect to /login if the user is not authenticated and accessing protected route
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect to /dashboard if the user is authenticated and accessing public route
  if (
    isPublicRoute &&
    hasSession &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

/**
 * Matcher configuration to exclude static assets and API routes.
 *
 * This prevents the middleware from running on:
 * - API routes (/api/*)
 * - Static assets (_next/static/*)
 * - Image optimization (_next/image)
 * - Favicon and other image files (*.png, *.jpg, etc.)
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)"],
};
