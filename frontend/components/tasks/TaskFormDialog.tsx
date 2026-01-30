"use client";

/**
 * TaskFormDialog component - Modal wrapper for TaskForm.
 *
 * This Client Component provides a modal dialog for creating new tasks.
 */

import { useState } from "react";
import { TaskForm } from "./TaskForm";
import type { TaskCreate } from "@/lib/types";

interface TaskFormDialogProps {
  /** Callback when task is created */
  onTaskCreated: (taskData: TaskCreate) => Promise<void>;
}

export function TaskFormDialog({ onTaskCreated }: TaskFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (taskData: TaskCreate) => {
    await onTaskCreated(taskData);
    setIsOpen(false); // Close dialog on success
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium shadow-sm"
      >
        + New Task
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create New Task
            </h2>

            <TaskForm
              onSubmit={handleSubmit}
              submitText="Create Task"
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
