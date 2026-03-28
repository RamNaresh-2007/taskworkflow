import { useEffect, useState } from 'react';
import { STATUSES, PRIORITIES } from '../data/contracts';

const STORAGE_KEY = 'task-workflow-portal:v1';

const initialTasks = [
  {
    id: '1',
    title: 'Design landing page',
    description: 'Create hero section and CTA for marketing site.',
    status: STATUSES.BACKLOG,
    priority: PRIORITIES.HIGH,
    deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  },
  {
    id: '2',
    title: 'Implement auth',
    description: 'Setup login flow and JWT handling.',
    status: STATUSES.IN_PROGRESS,
    priority: PRIORITIES.MEDIUM,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 Days later
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setTasks(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(initialTasks);
      }
    } catch (e) {
      setError('Failed to load tasks. Please refresh the page.');
    } finally {
      setLoading(false);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // silent fail is fine for demo
    }
  }, [tasks]);

  const createTask = (taskInput) => {
    const trimmedTitle = taskInput.title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }
    setError('');

    const newTask = {
      id: crypto.randomUUID?.() || String(Date.now()),
      title: trimmedTitle,
      description: taskInput.description?.trim() || '',
      status: taskInput.status || STATUSES.BACKLOG,
      priority: taskInput.priority || PRIORITIES.MEDIUM,
      deadline: taskInput.deadline || '',
      workerNumber: taskInput.workerNumber || '',
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTaskStatus = (taskId, nextStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );
  };

  const updateTaskDetails = (taskId, updatedData) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return {
    tasks,
    loading,
    error,
    searchQuery,
    createTask,
    updateTaskStatus,
    updateTaskDetails,
    deleteTask,
    setTasks,
    setSearchQuery,
  };
}
