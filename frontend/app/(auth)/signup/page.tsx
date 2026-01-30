/**
 * Signup page for new user registration.
 *
 * This page renders the SignupForm component and provides a dedicated
 * route for user signup at /signup. It's part of the (auth) route group
 * which can have its own layout if needed.
 */

import { SignupForm } from "@/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Todo App",
  description: "Create a new account to manage your tasks",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
}
