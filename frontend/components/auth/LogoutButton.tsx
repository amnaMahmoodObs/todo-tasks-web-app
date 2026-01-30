/**
 * Logout button component for ending user sessions.
 *
 * This component provides a button that allows authenticated users
 * to log out by clearing their JWT token and redirecting to the login page.
 *
 * Features:
 * - Calls backend logout endpoint
 * - Clears localStorage tokens
 * - Redirects to login page
 * - Handles errors gracefully
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequestWithToken } from "@/lib/api-client";

interface LogoutButtonProps {
  /** Optional custom className for styling */
  className?: string;
  /** Optional custom button text */
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * Handle user logout.
   */
  const handleLogout = async () => {
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("auth_token");

      if (token) {
        // Call backend logout endpoint
        await apiRequestWithToken("/api/auth/logout", token, {
          method: "POST",
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      setLoading(false);

      // Redirect to login
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={
        className ||
        "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
      }
    >
      {loading ? "Logging out..." : children || "Log Out"}
    </button>
  );
}
