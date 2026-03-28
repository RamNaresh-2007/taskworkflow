import React from 'react';
import { STATUS_COLORS, TASK_STATUSES } from '../data/contracts';

export const TaskCard = ({ task, onStatusChange }) => {
  const currentIndex = TASK_STATUSES.indexOf(task.status);
  const nextStatus =
    TASK_STATUSES[Math.min(currentIndex + 1, TASK_STATUSES.length - 1)];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}
        >
          {task.status.replace('-', ' ').toUpperCase()}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'high'
              ? 'bg-red-100 text-red-800'
              : task.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>

      <h3 className="text-md font-semibold text-gray-900 mb-1">
        {task.title}
      </h3>
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>

      <button
        onClick={() => onStatusChange(nextStatus)}
        className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Move to {nextStatus.replace('-', ' ')}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        Updated: {task.updatedAt.toLocaleDateString()}
      </p>
    </div>
  );
};
