import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskForm } from './TaskForm';

export function EditTask({ tasks, onSave, registeredUsers }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <section className="card">
        <h2>Task not found</h2>
        <button 
          onClick={() => navigate('/tasks')}
          style={{
            marginTop: '1rem',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer'
          }}
        >
          Go back
        </button>
      </section>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/tasks')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'background 0.2s'
          }}
        >
          &larr; Back
        </button>
      </div>
      <TaskForm 
        onSubmit={(data) => onSave(task.id, data)}
        registeredUsers={registeredUsers}
        initialData={task}
        isEdit={true}
      />
    </div>
  );
}
