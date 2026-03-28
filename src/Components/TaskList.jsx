import React from 'react';
import { STATUSES, PRIORITIES } from '../data/contracts';

const STATUS_LABEL = {
  [STATUSES.BACKLOG]: 'Backlog',
  [STATUSES.IN_PROGRESS]: 'In progress',
  [STATUSES.REVIEW]: 'In review',
  [STATUSES.DONE]: 'Done',
};

export function TaskList({ tasks, searchQuery, onStatusChange, onEdit, onDelete, userRole, registeredUsers = [] }) {
  const canChangeStatus = userRole === 'admin';

  const isOverdue = (deadline, status) => {
    if (!deadline || status === STATUSES.DONE) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const date = new Date(deadline);
    date.setHours(0,0,0,0);
    return date < today;
  };

  const getWorkerName = (num) => {
    const found = registeredUsers.find(u => u.workerNumber === num);
    return found ? found.name : null;
  };

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q)) ||
      (task.workerNumber && task.workerNumber.toLowerCase().includes(q))
    );
  });

  if (!filteredTasks.length) {
    return (
      <section className="card">
        <h2>Task list</h2>
        <p className="empty-state">
          No tasks yet. Create your first task to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Task list</h2>
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className="task-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3>{task.title}</h3>
                {task.deadline && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: isOverdue(task.deadline, task.status) ? 'var(--danger)' : 'var(--accent-orange)', 
                    background: isOverdue(task.deadline, task.status) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    border: `1px solid ${isOverdue(task.deadline, task.status) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` 
                  }}>
                    Due: {task.deadline} {isOverdue(task.deadline, task.status) && '(Overdue)'}
                  </span>
                )}
                {task.priority && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: task.priority === PRIORITIES.HIGH ? 'var(--danger)' : task.priority === PRIORITIES.MEDIUM ? 'var(--accent-orange)' : 'var(--accent-green)', 
                    background: 'var(--bg-surface)', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    border: `1px solid ${task.priority === PRIORITIES.HIGH ? 'rgba(248, 113, 113, 0.3)' : task.priority === PRIORITIES.MEDIUM ? 'rgba(251, 191, 36, 0.3)' : 'rgba(74, 222, 128, 0.3)'}` 
                  }}>
                    {task.priority}
                  </span>
                )}
                {task.workerNumber && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                    Worker: {getWorkerName(task.workerNumber) || String(task.workerNumber).toUpperCase()} #{task.workerNumber}
                  </span>
                )}
              </div>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
            </div>
            <div className="task-meta">
              <select
                value={task.status}
                onChange={(e) =>
                  canChangeStatus && onStatusChange(task.id, e.target.value)
                }
                disabled={!canChangeStatus}
              >
                {Object.values(STATUSES).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABEL[st]}
                  </option>
                ))}
              </select>
              {!canChangeStatus && (
                <p className="status-note">View only</p>
              )}
              {userRole === 'admin' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={() => onEdit(task.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      background: 'var(--bg-surface)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--danger)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
