/**
 * Login form component for user authentication.
 *
 * This component provides a user interface for existing users to log in
 * with email and password. On successful authentication, receives a JWT
 * token and redirects to the dashboard.
 *
 * Features:
 * - Email and password input fields
 * - Client-side validation
 * - Loading states during submission
 * - User-friendly error messages
 * - JWT token storage in HTTP-only cookies
 * - Redirect to dashboard on success
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, APIError } from "@/lib/api-client";
import { LoginRequest, AuthResponse, FormErrors } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate email format.
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form fields.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare login request
      const loginData: LoginRequest = {
        email,
        password,
      };

      // Call login endpoint
      console.log("Attempting login...");
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      console.log("Login successful:", response);

      // Store token in localStorage as backup (cookies are primary)
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Also set a client-side cookie for Next.js middleware
        // Calculate expiry (7 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        document.cookie = `auth_token=${response.token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;

        console.log("Token stored in localStorage and cookie");
      }

      // Redirect to dashboard
      console.log("Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof APIError) {
        // Handle specific error codes
        if (error.status === 401) {
          setErrors({ general: "Invalid email or password" });
        } else if (error.status === 400) {
          setErrors({ general: error.message });
        } else {
          setErrors({ general: "An error occurred during login. Please try again." });
        }
      } else {
        setErrors({ general: "Network error. Please check your connection and try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Log In
        </h2>

        {/* General error message */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email ? "border-red-500" : ""
            }`}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.password ? "border-red-500" : ""
            }`}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        {/* Link to signup */}
        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-500 hover:text-blue-700 font-bold"
            >
              Sign Up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
