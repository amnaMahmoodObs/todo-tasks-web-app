/**
 * TypeScript type definitions for the todo application.
 *
 * This module defines all interfaces and types used across the frontend
 * for type safety and better developer experience.
 */

/**
 * User account information.
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** User's email address */
  email: string;
  /** Optional display name */
  name?: string | null;
  /** Account creation timestamp (ISO 8601) */
  created_at: string;
  /** Last update timestamp (ISO 8601) */
  updated_at: string;
  // Note: password_hash is NEVER exposed to frontend
}

/**
 * User signup request payload.
 */
export interface SignupRequest {
  /** User's email address */
  email: string;
  /** User's password (min 8 characters) */
  password: string;
  /** Optional display name */
  name?: string;
}

/**
 * User login request payload.
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Authentication response from signup/login.
 */
export interface AuthResponse {
  /** User account information */
  user: User;
  /** JWT token for authentication */
  token: string;
  /** Token expiration timestamp (ISO 8601) */
  expires_at: string;
}

/**
 * Token verification response.
 */
export interface VerifyResponse {
  /** Whether the token is valid */
  valid: boolean;
  /** User information if token is valid */
  user: User;
  /** Token expiration timestamp (ISO 8601) */
  expires_at: string;
}

/**
 * API error response structure.
 */
export interface APIErrorResponse {
  /** Error message */
  error: string;
  /** Error code for programmatic handling */
  code?: string;
  /** HTTP status code */
  status?: number;
}

/**
 * Form field errors for validation.
 */
export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
}

/**
 * Task entity representing a user's todo item.
 */
export interface Task {
  /** Unique task identifier (auto-generated) */
  id: number;

  /** Owner user ID (UUID) */
  user_id: string;

  /** Task title (required, max 200 characters) */
  title: string;

  /** Optional description (max 1000 characters) */
  description: string | null;

  /** Completion status */
  completed: boolean;

  /** Creation timestamp (ISO 8601 format) */
  created_at: string;

  /** Last modification timestamp (ISO 8601 format) */
  updated_at: string;
}

/**
 * Request payload for creating a new task.
 */
export interface TaskCreate {
  /** Task title (required, max 200 characters) */
  title: string;

  /** Optional description (max 1000 characters) */
  description?: string | null;
}

/**
 * Request payload for updating a task.
 */
export interface TaskUpdate {
  /** Updated task title (max 200 characters) */
  title?: string;

  /** Updated description (max 1000 characters) */
  description?: string | null;
}

/**
 * API response for task list.
 */
export interface TaskListResponse {
  /** Array of tasks */
  tasks: Task[];

  /** Total number of tasks */
  count: number;
}
