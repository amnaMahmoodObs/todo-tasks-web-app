/**
 * Dashboard page for authenticated users.
 *
 * This is a protected route that displays user information and task management.
 *
 * Features:
 * - Displays current user information
 * - Protected by middleware (requires valid JWT token)
 * - Logout functionality
 * - Full task management (create, view, update, delete, toggle completion)
 * - Session restoration on page refresh
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiRequestWithToken,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from "@/lib/api-client";
import { User, Task, TaskCreate, TaskUpdate } from "@/lib/types";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskList } from "@/components/tasks/TaskList";

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /**
   * Verify authentication and load user data on mount.
   */
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Try to get token from localStorage
        const authToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user");

        if (!authToken || !storedUser) {
          // No token found, redirect to login
          router.push("/login");
          return;
        }

        // Parse stored user
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setToken(authToken);

        // Verify token is still valid with backend
        try {
          await apiRequestWithToken("/api/auth/verify", authToken);
          // Token is valid - now fetch tasks
          await loadTasks(parsedUser.id, authToken);
        } catch (verifyError) {
          // Token is invalid or expired, clear storage and redirect
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Session verification error:", err);
        setError("Failed to verify session");
        setLoading(false);
      }
    };

    verifySession();
  }, [router]);

  /**
   * Load tasks for the current user.
   */
  const loadTasks = async (userId: string, authToken: string) => {
    try {
      setTasksLoading(true);
      const response = await getTasks(userId, authToken);
      setTasks(response.tasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  /**
   * Handle task creation.
   */
  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user || !token) return;

    try {
      await createTask(user.id, token, taskData);
      await loadTasks(user.id, token);
    } catch (err) {
      console.error("Failed to create task:", err);
      throw err;
    }
  };

  /**
   * Handle task update.
   */
  const handleUpdateTask = async (taskId: number, taskData: TaskUpdate) => {
    if (!user || !token) return;

    try {
      await updateTask(user.id, taskId, token, taskData);
      await loadTasks(user.id, token);
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    }
  };

  /**
   * Handle task deletion.
   */
  const handleDeleteTask = async (taskId: number) => {
    if (!user || !token) return;

    try {
      await deleteTask(user.id, taskId, token);
      await loadTasks(user.id, token);
    } catch (err) {
      console.error("Failed to delete task:", err);
      throw err;
    }
  };

  /**
   * Handle task completion toggle.
   */
  const handleToggleComplete = async (taskId: number) => {
    if (!user || !token) return;

    try {
      await toggleTaskComplete(user.id, taskId, token);
      await loadTasks(user.id, token);
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
      throw err;
    }
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded px-8 py-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg px-8 py-6 mb-6 border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                Welcome{user?.name ? `, ${user.name}` : ""}!
              </h1>
              <p className="text-blue-600 mt-1">{user?.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Account info */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg px-6 py-6 border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                Account Info
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">User ID:</span>
                  <p className="text-gray-600 font-mono text-xs mt-1 break-all">
                    {user?.id}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-600 mt-1">{user?.email}</p>
                </div>
                {user?.name && (
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-gray-600 mt-1">{user.name}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-700">
                    Member Since:
                  </span>
                  <p className="text-gray-600 mt-1">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Task stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Task Statistics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-blue-900">
                      {tasks.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-semibold text-green-600">
                      {tasks.filter((t) => t.completed).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-semibold text-orange-600">
                      {tasks.filter((t) => !t.completed).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content - Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg px-8 py-6 border border-blue-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">My Tasks</h2>
                <TaskFormDialog onTaskCreated={handleCreateTask} />
              </div>

              {tasksLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
