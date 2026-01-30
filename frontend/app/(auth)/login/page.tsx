/**
 * Login page for user authentication.
 *
 * This page renders the LoginForm component and provides a dedicated
 * route for user login at /login. It's part of the (auth) route group
 * which can have its own layout if needed.
 */

import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Todo App",
  description: "Log in to your account to manage your tasks",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
