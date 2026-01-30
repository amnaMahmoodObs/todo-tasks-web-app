"use client";

/**
 * TaskList component - Displays a list of tasks.
 *
 * This Client Component renders multiple TaskItem components
 * and handles empty state display.
 */

import { TaskItem } from "./TaskItem";
import type { Task, TaskUpdate } from "@/lib/types";

interface TaskListProps {
  /** Array of tasks to display */
  tasks: Task[];

  /** Callback to toggle task completion */
  onToggleComplete: (taskId: number) => Promise<void>;

  /** Callback to update task */
  onUpdate: (taskId: number, data: TaskUpdate) => Promise<void>;

  /** Callback to delete task */
  onDelete: (taskId: number) => Promise<void>;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-gray-600">
          Create your first task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
