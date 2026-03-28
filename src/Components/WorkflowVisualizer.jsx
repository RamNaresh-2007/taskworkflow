// Components/WorkflowVisualizer.jsx
import React, { useState } from 'react';
import { STATUSES, STATUS_ORDER, PRIORITIES } from '../data/contracts';

const COLUMN_TITLE = {
  [STATUSES.BACKLOG]: 'Backlog',
  [STATUSES.IN_PROGRESS]: 'In progress',
  [STATUSES.REVIEW]: 'In review',
  [STATUSES.DONE]: 'Done',
};

export function WorkflowVisualizer({ tasks, searchQuery, onStatusChange, onEdit, onDelete, userRole, registeredUsers = [] }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

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

  const tasksByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = filteredTasks.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>Workflow</h2>

      <div style={styles.board}>
        {STATUS_ORDER.map((status) => (
          <div 
            key={status} 
            style={styles.column}
            onDragOver={(e) => {
               e.preventDefault(); 
               e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData('text/plain');
              if (taskId && onStatusChange) {
                onStatusChange(taskId, status);
              }
              setDraggedTaskId(null);
            }}
          >
            <div style={styles.columnHeader}>
              <h3 style={styles.columnTitle}>{COLUMN_TITLE[status]}</h3>
              <span style={styles.columnCount}>
                {tasksByStatus[status].length} task
                {tasksByStatus[status].length === 1 ? '' : 's'}
              </span>
            </div>

            {tasksByStatus[status].length === 0 && (
              <p style={styles.emptyColumn}>No tasks</p>
            )}

            {tasksByStatus[status].map((task) => (
              <article 
                key={task.id} 
                style={{
                  ...styles.taskCard,
                  opacity: draggedTaskId === task.id ? 0.5 : 1
                }}
                draggable={userRole === 'admin'}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id);
                  setDraggedTaskId(task.id);
                }}
                onDragEnd={() => setDraggedTaskId(null)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={styles.taskTitle}>{task.title}</h4>
                    {task.workerNumber && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-glass)', width: 'fit-content' }}>
                        Worker: {getWorkerName(task.workerNumber) || task.workerNumber} #{task.workerNumber}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {task.deadline && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: isOverdue(task.deadline, task.status) ? 'var(--danger)' : 'var(--accent-orange)', 
                          background: isOverdue(task.deadline, task.status) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                          padding: '2px 4px', 
                          borderRadius: '4px', 
                          border: `1px solid ${isOverdue(task.deadline, task.status) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` 
                        }}>
                          {task.deadline} {isOverdue(task.deadline, task.status) && '(!)'}
                        </span>
                      )}
                      {task.priority && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: task.priority === PRIORITIES.HIGH ? 'var(--danger)' : task.priority === PRIORITIES.MEDIUM ? 'var(--accent-orange)' : 'var(--accent-green)', 
                          background: 'var(--bg-surface)', 
                          padding: '2px 4px', 
                          borderRadius: '4px', 
                          border: `1px solid ${task.priority === PRIORITIES.HIGH ? 'rgba(248, 113, 113, 0.3)' : task.priority === PRIORITIES.MEDIUM ? 'rgba(251, 191, 36, 0.3)' : 'rgba(74, 222, 128, 0.3)'}` 
                        }}>
                          {task.priority}
                        </span>
                      )}
                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(task.id); }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent-blue)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              padding: '0 4px',
                            }}
                            title="Edit task"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              padding: '0 4px',
                              lineHeight: 1
                            }}
                            title="Delete task"
                          >
                            &times;
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  {task.description && (
                    <p style={styles.taskDescription}>{task.description}</p>
                  )}
                </div>

                <div style={styles.taskActions}>
                  {STATUS_ORDER.map((target) => (
                    <button
                      key={target}
                      type="button"
                      disabled={target === status}
                      onClick={() => onStatusChange(task.id, target)}
                      style={{
                        ...styles.actionButton,
                        ...(target === status ? styles.actionButtonActive : {}),
                      }}
                    >
                      {COLUMN_TITLE[target]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* “CSS” as JS style objects, local to this component only */
const styles = {
  card: {
    background: 'radial-gradient(circle at top, var(--border-subtle), transparent 55%), var(--bg-card)',
    borderRadius: '18px',
    border: '1px solid var(--border-glass)',
    boxShadow: 'var(--shadow-md)',
    padding: '1.5rem 1.75rem',
    marginTop: '0.75rem',
  },
  title: {
    margin: 0,
    marginBottom: '1rem',
    fontSize: '1.3rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '1rem',
  },
  column: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-glass)',
    padding: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minHeight: 180,
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '0.25rem',
  },
  columnTitle: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    margin: 0,
  },
  columnCount: {
    fontSize: '0.8rem',
    color: 'var(--text-soft)',
  },
  emptyColumn: {
    fontSize: '0.85rem',
    color: 'var(--text-soft)',
    fontStyle: 'italic',
    margin: 0,
  },
  taskCard: {
    borderRadius: '12px',
    background: 'radial-gradient(circle at top, var(--border-subtle), transparent 55%), var(--bg-surface)',
    border: '1px solid var(--border-glass)',
    padding: '0.75rem 0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.9rem',
    cursor: 'grab',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
  },
  taskTitle: {
    margin: 0,
    fontWeight: 500,
  },
  taskDescription: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  taskActions: {
    marginTop: '0.4rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  actionButton: {
    borderRadius: '999px',
    border: '1px solid var(--border-strong)',
    background: 'var(--bg-surface-hover)',
    color: 'var(--text-main)',
    fontSize: '0.75rem',
    padding: '0.25rem 0.6rem',
    cursor: 'pointer',
    transition: 'background 0.15s ease, transform 0.15s ease, border-color 0.15s ease',
  },
  actionButtonActive: {
    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
    borderColor: 'var(--accent-indigo)',
    color: '#ffffff',
    cursor: 'default',
  },
};
