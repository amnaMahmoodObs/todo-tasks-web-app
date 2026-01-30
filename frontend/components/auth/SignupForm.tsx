




/**
 * Signup form component for user registration.
 *
 * This component provides a user interface for new users to create accounts
 * with email, password, and optional name fields. Includes client-side
 * validation for email format and password length (min 8 characters).
 *
 * Features:
 * - Email format validation
 * - Password minimum length validation
 * - Loading states during submission
 * - User-friendly error messages
 * - Redirect to login page on success
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, APIError } from "@/lib/api-client";
import { SignupRequest, FormErrors } from "@/lib/types";

export function SignupForm() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors and success
    setErrors({});
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare signup request
      const signupData: SignupRequest = {
        email,
        password,
        ...(name && { name }), // Include name only if provided
      };

      // Call signup endpoint
      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(signupData),
      });

      // Show success message
      setSuccess(true);

      // Redirect to login page after 1 second
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      if (error instanceof APIError) {
        // Handle specific error codes
        if (error.code === "EMAIL_EXISTS" || error.status === 409) {
          setErrors({ email: "This email is already registered. Please log in instead" });
        } else if (error.status === 400) {
          setErrors({ general: error.message });
        } else {
          setErrors({ general: "An error occurred during signup. Please try again." });
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
          Create Account
        </h2>

        {/* Success message */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Account created successfully! Redirecting to login...
          </div>
        )}

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
            disabled={loading || success}
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
        <div className="mb-4">
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
            disabled={loading || success}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.password ? "border-red-500" : ""
            }`}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>
          )}
          <p className="text-gray-600 text-xs mt-1">
            Must be at least 8 characters long
          </p>
        </div>

        {/* Name field (optional) */}
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Name <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || success}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="John Doe"
            autoComplete="name"
          />
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading || success ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>

        {/* Link to login */}
        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-700 font-bold"
            >
              Log In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
