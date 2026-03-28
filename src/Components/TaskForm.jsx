// Components/TaskForm.jsx
import React, { useState } from 'react';
import { STATUSES, PRIORITIES } from '../data/contracts';

export function TaskForm({ onSubmit, registeredUsers = [], initialData = null, isEdit = false }) {
  const workers = registeredUsers.filter(u => u.role === 'worker');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || STATUSES.BACKLOG);
  const [priority, setPriority] = useState(initialData?.priority || PRIORITIES.MEDIUM);
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [workerNumber, setWorkerNumber] = useState(initialData?.workerNumber || '');
  const [keepData, setKeepData] = useState(false);

  React.useEffect(() => {
    if (isEdit) return;
    const draft = localStorage.getItem('taskFormDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.status) setStatus(parsed.status);
        if (parsed.priority) setPriority(parsed.priority);
        if (parsed.deadline) setDeadline(parsed.deadline);
        if (parsed.workerNumber) setWorkerNumber(parsed.workerNumber);
        if (parsed.keepData !== undefined) setKeepData(parsed.keepData);
      } catch (e) {
        console.error("Failed to parse form draft", e);
      }
    }
  }, [isEdit]);

  React.useEffect(() => {
    if (isEdit) return;
    const data = { title, description, status, priority, deadline, workerNumber, keepData };
    localStorage.setItem('taskFormDraft', JSON.stringify(data));
  }, [title, description, status, priority, deadline, workerNumber, keepData, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, status, priority, deadline, workerNumber });
    if (!keepData && !isEdit) {
      setTitle('');
      setDescription('');
      setStatus(STATUSES.BACKLOG);
      setPriority(PRIORITIES.MEDIUM);
      setDeadline('');
      setWorkerNumber('');
      localStorage.removeItem('taskFormDraft');
    }
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.title}>{isEdit ? 'Edit task' : 'Create new task'}</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>
          <span style={styles.labelText}>Title</span>
          <input
            type="text"
            placeholder="Short task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Description</span>
          <textarea
            rows={3}
            placeholder="Optional details, acceptance criteria, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...styles.input, ...styles.textarea }}
          />
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.input}
          >
            <option value={STATUSES.BACKLOG}>Backlog</option>
            <option value={STATUSES.IN_PROGRESS}>In progress</option>
            <option value={STATUSES.REVIEW}>In review</option>
            <option value={STATUSES.DONE}>Done</option>
          </select>
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={styles.input}
          >
            <option value={PRIORITIES.LOW}>Low</option>
            <option value={PRIORITIES.MEDIUM}>Medium</option>
            <option value={PRIORITIES.HIGH}>High</option>
          </select>
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Deadline Option</span>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ ...styles.input }}
          />
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Assigned Worker</span>
          <select
            value={workerNumber}
            onChange={(e) => setWorkerNumber(e.target.value)}
            style={styles.input}
          >
            <option value="">Unassigned</option>
            {workers.map((w, idx) => (
              <option key={idx} value={w.workerNumber}>
                {w.name} (#{w.workerNumber})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', margin: '4px 0 0 0' }}>
            Only registered workers appear here.
          </p>
        </label>

        <div style={styles.actions}>
          {!isEdit && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={keepData} 
                onChange={(e) => setKeepData(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              Save previous data for next task
            </label>
          )}
          <button type="submit" style={styles.buttonPrimary}>
            {isEdit ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </section>
  );
}

/* Local “CSS” as JS style objects */
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
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.9rem',
  },
  labelText: {
    color: 'var(--text-soft)',
    fontWeight: 500,
  },
  input: {
    borderRadius: '12px',
    border: '1px solid var(--border-strong)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-main)',
    padding: '0.6rem 0.8rem',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, transform 0.1s ease',
  },
  textarea: {
    minHeight: 90,
    resize: 'vertical',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.35rem',
  },
  buttonPrimary: {
    borderRadius: '999px',
    border: '1px solid var(--border-glass)',
    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
    color: '#ffffff',
    fontSize: '0.9rem',
    padding: '0.5rem 1.2rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
};
