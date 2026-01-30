"use client";

/**
 * TaskItem component - Displays a single task with actions.
 *
 * This Client Component renders a task card with title, description,
 * completion toggle, edit, and delete actions.
 */

import { useState } from "react";
import { TaskForm } from "./TaskForm";
import type { Task, TaskUpdate } from "@/lib/types";

interface TaskItemProps {
  /** Task to display */
  task: Task;

  /** Callback to toggle completion */
  onToggleComplete: (taskId: number) => Promise<void>;

  /** Callback to update task */
  onUpdate: (taskId: number, data: TaskUpdate) => Promise<void>;

  /** Callback to delete task */
  onDelete: (taskId: number) => Promise<void>;
}

export function TaskItem({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: TaskUpdate) => {
    await onUpdate(task.id, data);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this task? This action cannot be undone."
      )
    ) {
      setLoading(true);
      try {
        await onDelete(task.id);
      } finally {
        setLoading(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description,
          }}
          onSubmit={handleUpdate}
          submitText="Save Changes"
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
        task.completed
          ? "border-gray-200 bg-gray-50"
          : "border-blue-100 hover:border-blue-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={loading}
          className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />

        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-medium ${
              task.completed
                ? "text-gray-500 line-through"
                : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`mt-1 text-sm ${
                task.completed ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>
              Created: {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.updated_at !== task.created_at && (
              <span>
                Updated: {new Date(task.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
