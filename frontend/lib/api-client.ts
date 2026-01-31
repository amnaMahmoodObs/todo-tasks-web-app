/**
 * Centralized API client for backend communication.
 *
 * This module provides a unified interface for making authenticated
 * API requests to the FastAPI backend with proper error handling.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Custom error class for API errors.
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Make an authenticated API request.
 *
 * @param endpoint - API endpoint path (e.g., "/api/tasks")
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 * @throws APIError if the request fails
 *
 * @example
 * ```typescript
 * // GET request
 * const tasks = await apiRequest("/api/tasks");
 *
 * // POST request
 * const newTask = await apiRequest("/api/tasks", {
 *   method: "POST",
 *   body: JSON.stringify({ title: "New task" }),
 * });
 * ```
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Send cookies with request
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Parse response body
    const data = await response.json().catch(() => null);

    // Handle HTTP errors
    if (!response.ok) {
      throw new APIError(
        data?.detail || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data?.code
      );
    }

    return data as T;
  } catch (error) {
    // Re-throw API errors
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    throw new APIError(
      error instanceof Error ? error.message : "Network error occurred",
      0
    );
  }
}

/**
 * Make an authenticated API request with Authorization header.
 *
 * @param endpoint - API endpoint path
 * @param token - JWT token
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws APIError if the request fails
 *
 * @example
 * ```typescript
 * const user = await apiRequestWithToken("/api/auth/verify", token);
 * ```
 */
export async function apiRequestWithToken<T = any>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================================================
// Task API Client Functions
// ============================================================================

import type { Task, TaskCreate, TaskUpdate, TaskListResponse } from "./types";

/**
 * Get all tasks for the authenticated user.
 *
 * @param userId - User ID (from JWT token)
 * @param token - JWT authentication token
 * @returns Task list response with tasks array and count
 * @throws APIError if the request fails
 *
 * @example
 * ```typescript
 * const { tasks, count } = await getTasks(userId, token);
 * ```
 */
export async function getTasks(
  userId: string,
  token: string
): Promise<TaskListResponse> {
  return apiRequestWithToken<TaskListResponse>(
    `/api/${userId}/tasks`,
    token
  );
}

/**
 * Create a new task for the authenticated user.
 *
 * @param userId - User ID (from JWT token)
 * @param token - JWT authentication token
 * @param taskData - Task creation data (title and optional description)
 * @returns Created task
 * @throws APIError if the request fails (400 for validation errors)
 *
 * @example
 * ```typescript
 * const task = await createTask(userId, token, {
 *   title: "Buy groceries",
 *   description: "Milk, eggs, bread"
 * });
 * ```
 */
export async function createTask(
  userId: string,
  token: string,
  taskData: TaskCreate
): Promise<Task> {
  return apiRequestWithToken<Task>(`/api/${userId}/tasks`, token, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

/**
 * Get a single task by ID for the authenticated user.
 *
 * @param userId - User ID (from JWT token)
 * @param taskId - Task ID
 * @param token - JWT authentication token
 * @returns Task details
 * @throws APIError if the request fails (404 if not found)
 *
 * @example
 * ```typescript
 * const task = await getTask(userId, taskId, token);
 * ```
 */
export async function getTask(
  userId: string,
  taskId: number,
  token: string
): Promise<Task> {
  return apiRequestWithToken<Task>(`/api/${userId}/tasks/${taskId}`, token);
}

/**
 * Update a task's title and/or description.
 *
 * @param userId - User ID (from JWT token)
 * @param taskId - Task ID
 * @param token - JWT authentication token
 * @param taskData - Updated task data
 * @returns Updated task
 * @throws APIError if the request fails (404 if not found, 400 for validation)
 *
 * @example
 * ```typescript
 * const updated = await updateTask(userId, taskId, token, {
 *   title: "Updated title"
 * });
 * ```
 */
export async function updateTask(
  userId: string,
  taskId: number,
  token: string,
  taskData: TaskUpdate
): Promise<Task> {
  return apiRequestWithToken<Task>(`/api/${userId}/tasks/${taskId}`, token, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
}

/**
 * Delete a task permanently.
 *
 * @param userId - User ID (from JWT token)
 * @param taskId - Task ID
 * @param token - JWT authentication token
 * @throws APIError if the request fails (404 if not found)
 *
 * @example
 * ```typescript
 * await deleteTask(userId, taskId, token);
 * ```
 */
export async function deleteTask(
  userId: string,
  taskId: number,
  token: string
): Promise<void> {
  await apiRequestWithToken<void>(`/api/${userId}/tasks/${taskId}`, token, {
    method: "DELETE",
  });
}

/**
 * Toggle a task's completion status (complete <-> incomplete).
 *
 * @param userId - User ID (from JWT token)
 * @param taskId - Task ID
 * @param token - JWT authentication token
 * @returns Updated task with toggled completion status
 * @throws APIError if the request fails (404 if not found)
 *
 * @example
 * ```typescript
 * const toggled = await toggleTaskComplete(userId, taskId, token);
 * ```
 */
export async function toggleTaskComplete(
  userId: string,
  taskId: number,
  token: string
): Promise<Task> {
  return apiRequestWithToken<Task>(
    `/api/${userId}/tasks/${taskId}/complete`,
    token,
    {
      method: "PATCH",
    }
  );
}
