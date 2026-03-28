// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { TaskList } from './Components/TaskList';
import { TaskForm } from './Components/TaskForm';
import { EditTask } from './Components/EditTask';
import { WorkflowVisualizer } from './Components/WorkflowVisualizer';
import { useTasks } from './hooks/useTasks';
import { Layout } from './Components/Layout';
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
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
  } = useTasks();

  const handleBackup = () => {
    const backupData = {
      tasks,
      registeredUsers,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-workflow-backup-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAuthSuccess('Backup file downloaded! You can now send this file to other devices.');
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tasks && data.registeredUsers) {
          setTasks(data.tasks);
          setRegisteredUsers(data.registeredUsers);
          setAuthSuccess('Data successfully restored! All tasks and workers are now up to date.');
          navigate('/tasks');
        } else {
          setAuthError('Invalid backup file format. Please use a file exported from this portal.');
        }
      } catch (err) {
        setAuthError('Failed to parse backup file. Please ensure it is a valid .json file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleGenerateSyncCode = () => {
    const data = { tasks, registeredUsers };
    const code = btoa(encodeURIComponent(JSON.stringify(data)));
    navigator.clipboard.writeText(code);
    setAuthSuccess("Portal Sync Key copied! Your friend can paste this into their 'Join Portal' box.");
  };

  const handleGenerateShareLink = () => {
    const data = { tasks, registeredUsers };
    const serialized = btoa(encodeURIComponent(JSON.stringify(data)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?sync=${serialized}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setAuthSuccess("Portal Share Link copied! Send this link to others to sync all accounts instantly.");
    }).catch(() => {
      setAuthError("Failed to copy link. Please manually copy the Sync Key instead.");
    });
  };

  const handleApplySyncCode = (e) => {
    if (e && e.preventDefault && typeof e !== 'string') e.preventDefault();
    const codeToUse = typeof e === 'string' ? e : syncCode;

    if (!codeToUse || !codeToUse.trim()) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(codeToUse.trim())));
      if (decoded.tasks && decoded.registeredUsers) {
        setTasks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newTasks = decoded.tasks.filter(t => !existingIds.has(t.id));
          return [...prev, ...newTasks];
        });
        setRegisteredUsers(prev => {
          const existingEmails = new Set(prev.map(u => u.email));
          const newUsers = decoded.registeredUsers.filter(u => !existingEmails.has(u.email));
          return [...prev, ...newUsers];
        });
        setAuthSuccess("Portal Synchronized! accounts and tasks from the shared file have been merged.");
        setAuthError(null);
        setSyncCode('');
        if (typeof e === 'string') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setAuthError("Invalid sync data structure. Please use a valid Portal Sync Key.");
      }
    } catch (err) {
      setAuthError("Failed to sync. Please ensure the link/code is valid.");
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'app-search-query') {
        setSearchQuery(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setSearchQuery]);

  useEffect(() => {
    localStorage.setItem('app-search-query', searchQuery);
  }, [searchQuery]);

  // now: 'start' | 'portal' | 'auth'
  const [currentView, setCurrentView] = useState('start');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authRole, setAuthRole] = useState('worker'); // 'admin' | 'worker'

  const [userRole, setUserRole] = useState(null); // 'admin' | 'worker' | null
  const [currentUser, setCurrentUser] = useState(null); // {name,email,role} | null
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(null);

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authWorkerNumber, setAuthWorkerNumber] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [previousLogins, setPreviousLogins] = useState([]);

  // ---------- PERSISTENCE & CROSS-TAB SYNC ----------
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'registeredUsers' && e.newValue) {
        setRegisteredUsers(JSON.parse(e.newValue));
      }
      if (e.key === 'currentUser' && e.newValue) {
        setCurrentUser(JSON.parse(e.newValue));
      }
      if (e.key === 'userRole') {
        setUserRole(e.newValue);
        if (!e.newValue) setCurrentView('start');
        else if (currentView === 'start') setCurrentView('portal');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'admin' || savedRole === 'worker') {
      setUserRole(savedRole);
      setCurrentView('portal');
    }

    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) {
          setRegisteredUsers(parsed);
        }
      } catch { }
    }

    const savedCurrentUser = localStorage.getItem('currentUser');
    if (savedCurrentUser) {
      try {
        const parsedUser = JSON.parse(savedCurrentUser);
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setCurrentUser(parsedUser);
        }
      } catch { }
    }

    // Check for URL sync on mount
    const params = new URLSearchParams(window.location.search);
    const syncParam = params.get('sync');
    if (syncParam) {
      handleApplySyncCode(syncParam);
    }

    // Check for remembered email
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setAuthEmail(remembered);
      setRememberMe(true);
    }

    // Check for previous logins list
    const savedLogins = localStorage.getItem('previousLogins');
    if (savedLogins) {
      try {
        setPreviousLogins(JSON.parse(savedLogins));
      } catch { }
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // ---------- DERIVED ----------
  const displayTasks = userRole === 'worker' && currentUser?.workerNumber
    ? tasks.filter(t => t.workerNumber === currentUser.workerNumber)
    : tasks;

  const totalTasks = displayTasks.length;
  const inProgressCount = displayTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = displayTasks.filter((t) => t.status === 'DONE').length;
  const pendingCount = totalTasks - completedCount;

  const roleLabel =
    userRole === 'admin' ? 'Admin' : userRole === 'worker' ? 'Worker' : 'Guest';

  // ---------- AUTH HELPERS ----------
  const openAuth = (mode, role) => {
    setCurrentView('auth');
    setAuthMode(mode);
    setAuthRole(role);
    setAuthError(null);
    setAuthSuccess(null);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (authMode === 'register') {
      const email = authEmail.trim().toLowerCase();
      const exists = registeredUsers.some((u) => u.email === email);

      if (exists) {
        setAuthError('An account with this email already exists.');
        return;
      }

      const nextWorkerNum = authRole === 'worker'
        ? (registeredUsers.filter(u => u.role === 'worker').length + 101).toString()
        : null;

      const newUser = {
        role: authRole,
        email,
        password: authPassword,
        name: authName || (authRole === 'admin' ? 'Admin' : 'Worker'),
        workerNumber: nextWorkerNum,
      };

      setRegisteredUsers((prev) => [...prev, newUser]);
      setAuthSuccess(`Registration successful! Your ${authRole === 'worker' ? 'Token Number is ' + nextWorkerNum : 'account is ready'}. You can now log in.`);
      setAuthMode('login');
      setAuthPassword('');
      setAuthWorkerNumber(''); // Reset
      return;
    }

    if (authMode === 'login') {
      const email = authEmail.trim().toLowerCase();
      const found = registeredUsers.find(
        (u) =>
          u.role === authRole &&
          u.email === email &&
          u.password === authPassword
      );

      if (!found) {
        setAuthError('Invalid credentials for this role. Try again.');
        return;
      }

      setUserRole(found.role);
      setCurrentUser({
        name: found.name,
        email: found.email,
        role: found.role,
        workerNumber: found.workerNumber,
      });

      // Update last login in registered users
      setRegisteredUsers(prev => prev.map(u =>
        u.email === found.email ? { ...u, lastLogin: new Date().toLocaleString() } : u
      ));

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Add to previous logins list
      setPreviousLogins(prev => {
        const newList = [
          { email: found.email, name: found.name, role: found.role, lastLogin: new Date().toLocaleString() },
          ...prev.filter(l => l.email !== found.email)
        ].slice(0, 3); // Keep last 3
        localStorage.setItem('previousLogins', JSON.stringify(newList));
        return newList;
      });

      setCurrentView('portal');
      setAuthSuccess(null);
      setAuthPassword('');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setAuthError(null);
    setAuthSuccess(null);
    setCurrentView('start');
  };


  // ---------- AUTH VIEW ----------
  if (currentView === 'auth') {
    const isLogin = authMode === 'login';
    const title = isLogin
      ? `${authRole === 'admin' ? 'Admin' : 'Worker'} Login`
      : `${authRole === 'admin' ? 'Admin' : 'Worker'} Registration`;

    return (
      <Layout currentUser={currentUser} userRole={userRole} onLogout={handleLogout}>
        <div className="app auth-app">
          <div className="auth-card card">
            <h2>{title}</h2>
            <p className="subtitle">
              {isLogin
                ? 'Sign in with your registered account.'
                : 'Create a simple demo account (kept in this browser).'}
            </p>

            <div className="auth-toggle">
              <button
                type="button"
                className={isLogin ? 'toggle-btn active' : 'toggle-btn'}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={!isLogin ? 'toggle-btn active' : 'toggle-btn'}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            <div className="role-toggle">
              <button
                type="button"
                className={authRole === 'admin' ? 'role-btn active' : 'role-btn'}
                onClick={() => setAuthRole('admin')}
              >
                Admin
              </button>
              <button
                type="button"
                className={authRole === 'worker' ? 'role-btn active' : 'role-btn'}
                onClick={() => setAuthRole('worker')}
              >
                Worker
              </button>
            </div>

            {authError && <p className="auth-error">{authError}</p>}
            {authSuccess && <p className="auth-success">{authSuccess}</p>}

            {isLogin && previousLogins.length > 0 && (
              <div className="previous-logins">
                <p className="tiny-label">RECENTLY LOGGED IN</p>
                <div className="login-chips">
                  {previousLogins.map((login, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="login-chip"
                      onClick={() => {
                        setAuthEmail(login.email);
                        setAuthRole(login.role);
                      }}
                    >
                      <div className={`chip-role role-${login.role}`}></div>
                      <span>{login.name || login.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <label>
                  Name
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your name"
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </label>

              <label>
                Password
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCredentials ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    minLength={6}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-soft)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {showCredentials ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </label>

              {isLogin && (
                <div className="form-options">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  <a href="#" className="forgot-link">Forgot?</a>
                </div>
              )}

              <div className="auth-actions">
                <button type="submit" className="primary-btn">
                  {isLogin ? 'Sign in' : 'Create account'}
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setCurrentView('start')}
                >
                  Back
                </button>
              </div>
            </form>

            <p className="demo-note">
              Accounts and current user are stored in this browser (localStorage).
            </p>
          </div>
        </div>
      </Layout >
    );
  }

  // ---------- MAIN PORTAL ----------
  return (
    <Layout currentUser={currentUser} userRole={userRole} onLogout={handleLogout}>
      <div className="app">
        <header className="app-header card dashboard-header">
          <div className="header-main">
            <div className="header-title-block">
              <h1>Taskwork Flow Portal</h1>

              {authError && <p className="auth-error">{authError}</p>}
              {authSuccess && <p className="auth-success inline-block" style={{ marginBottom: '1rem' }}>{authSuccess}</p>}

              {!userRole && !authError && !authSuccess && (
                <p className="auth-error">
                  You must login or register before managing tasks.
                </p>
              )}

              {userRole && !authSuccess && !authError && (
                <p className="auth-success inline">
                  Logged in as{' '}
                  <span className="user-name-highlight">
                    {currentUser?.name || roleLabel}
                  </span>
                  .
                </p>
              )}
            </div>

            {!userRole ? (
              <>
                <div className="auth-buttons">
                  <button
                    className="login-btn admin-btn"
                    type="button"
                    onClick={() => openAuth('login', 'admin')}
                  >
                    Admin Login
                  </button>
                  <button
                    className="login-btn worker-btn"
                    type="button"
                    onClick={() => openAuth('login', 'worker')}
                  >
                    Worker Login
                  </button>
                  <button
                    className="login-btn ghost"
                    type="button"
                    onClick={() => openAuth('register', 'worker')}
                  >
                    Register
                  </button>
                </div>

                <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-soft)', marginBottom: '1rem' }}>Joined from another device?</h4>
                  <form onSubmit={handleApplySyncCode} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <input
                      type="text"
                      placeholder="Paste Portal Sync Key here..."
                      value={syncCode}
                      onChange={(e) => setSyncCode(e.target.value)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-main)',
                        width: '260px',
                        fontSize: '0.8rem'
                      }}
                    />
                    <button type="submit" className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      Join Portal
                    </button>
                  </form>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.5rem' }}>
                    One-click sync: Moves all accounts and tasks to this device.
                  </p>
                </div>
              </>
            ) : (
              <div className="user-info">
                <span className={`role-badge role-${userRole}`}>
                  {userRole.toUpperCase()}
                </span>
                {currentUser && (
                  <div className="user-extra">
                    <span className="user-name-highlight">
                      {currentUser.name} {currentUser.workerNumber && `(#${currentUser.workerNumber})`}
                    </span>
                  </div>
                )}
                <button
                  className="logout-btn"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="stat-row header-stats">
            <div className="stat-card">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{totalTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{inProgressCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completedCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{pendingCount}</div>
            </div>
          </div>

          <nav className="app-nav">
            <button
              type="button"
              className={
                !userRole
                  ? 'nav-btn nav-btn-disabled'
                  : location.pathname === '/tasks' || location.pathname === '/'
                    ? 'nav-btn active'
                    : 'nav-btn'
              }
              onClick={() => {
                if (!userRole) return;
                navigate('/tasks');
              }}
              disabled={!userRole}
            >
              Task List
            </button>

            <button
              type="button"
              className={
                !userRole || userRole === 'worker'
                  ? 'nav-btn nav-btn-disabled'
                  : location.pathname === '/tasks/new'
                    ? 'nav-btn active'
                    : 'nav-btn'
              }
              onClick={() => {
                if (!userRole || userRole === 'worker') return;
                navigate('/tasks/new');
              }}
              disabled={!userRole || userRole === 'worker'}
            >
              New Task
            </button>

            <button
              type="button"
              className={
                !userRole
                  ? 'nav-btn nav-btn-disabled'
                  : location.pathname === '/workflow'
                    ? 'nav-btn active'
                    : 'nav-btn'
              }
              onClick={() => {
                if (!userRole) return;
                navigate('/workflow');
              }}
              disabled={!userRole}
            >
              Workflow Board
            </button>

            {userRole === 'admin' && (
              <button
                type="button"
                className={
                  location.pathname === '/users'
                    ? 'nav-btn active'
                    : 'nav-btn'
                }
                onClick={() => navigate('/users')}
              >
                Workers Directory
              </button>
            )}
          </nav>

          {userRole && (
            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder={userRole === 'admin' ? "Search tasks, numbers, etc..." : "Enter your Worker ID to see your tasks..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="global-search-input"
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
          )}
        </header>

        <main className="app-main">
          {!userRole && (
            <p className="status-message">
              Please login or register to view and manage tasks.
            </p>
          )}

          {userRole && loading && (
            <p className="status-message">Loading tasks…</p>
          )}
          {userRole && error && !loading && (
            <p className="status-message error-message">{error}</p>
          )}

          <Routes>
            <Route path="/tasks/new" element={
              userRole === 'admin' && !loading && !error && (
                <TaskForm onSubmit={(input) => { createTask(input); navigate('/tasks'); }} registeredUsers={registeredUsers} />
              )
            } />
            <Route path="/tasks/edit/:id" element={
              userRole === 'admin' && !loading && !error && (
                <EditTask 
                  tasks={displayTasks}
                  onSave={(taskId, updatedData) => { updateTaskDetails(taskId, updatedData); navigate('/tasks'); }} 
                  registeredUsers={registeredUsers} 
                />
              )
            } />
            <Route path="/tasks" element={
              userRole && !loading && !error && (
                <TaskList
                  tasks={displayTasks}
                  searchQuery={searchQuery}
                  onStatusChange={updateTaskStatus}
                  onEdit={(id) => navigate(`/tasks/edit/${id}`)}
                  onDelete={deleteTask}
                  userRole={userRole}
                  registeredUsers={registeredUsers}
                />
              )
            } />
            <Route path="/" element={<Navigate replace to="/tasks" />} />

            <Route path="/users" element={
              userRole === 'admin' && !loading && !error && (
                <section className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Portal Management</h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        className="primary-btn"
                        onClick={handleBackup}
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        title="Download a backup file to send to other devices"
                      >
                        Backup & Export (.json)
                      </button>
                      <button
                        className="primary-btn"
                        onClick={handleGenerateShareLink}
                        style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        title="Generate a URL link that automatically syncs this portal to another device"
                      >
                        Share Portal Link
                      </button>
                      <button
                        className="primary-btn"
                        onClick={handleGenerateSyncCode}
                        style={{ padding: '8px 16px', fontSize: '0.8rem', background: 'var(--accent-indigo)' }}
                        title="Generate a sync code to easily move all data to another device"
                      >
                        Copy Sync Key
                      </button>
                      <label
                        className="ghost-btn"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          border: '1px solid var(--border-glass)',
                          background: 'rgba(255,255,255,0.05)',
                          cursor: 'pointer'
                        }}
                        title="Upload a backup file from another device"
                      >
                        Restore & Sync
                        <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-soft)' }}>Join From Another Device</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '1rem' }}>Paste a Sync Key here to merge data from another portal instantly.</p>
                    <form onSubmit={handleApplySyncCode} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Paste Portal Sync Key..."
                        value={syncCode}
                        onChange={(e) => setSyncCode(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-glass)',
                          color: '#fff',
                          fontSize: '0.8rem'
                        }}
                      />
                      <button type="submit" className="primary-btn" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                        Merge Data
                      </button>
                    </form>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <h3>Worker Directory</h3>
                    {registeredUsers.filter(u => u.role === 'worker').length === 0 ? (
                      <p className="empty-state">No workers registered yet.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        {registeredUsers.filter(u => u.role === 'worker').map((u, idx) => (
                          <div key={idx} className="task-row" style={{ padding: '1rem' }}>
                            <div>
                              <h3 style={{ margin: 0 }}>{u.name}</h3>
                              <p style={{ margin: '4px 0', fontSize: '0.85rem', opacity: 0.7 }}>{u.email}</p>
                              {u.lastLogin && (
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-indigo)' }}>
                                  Last active: {u.lastLogin}
                                </p>
                              )}
                            </div>
                            <div className="role-badge role-worker">
                              # {u.workerNumber || 'No ID'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )
            } />

            <Route path="/workflow" element={
              userRole && !loading && !error && (
                <WorkflowVisualizer
                  tasks={displayTasks}
                  searchQuery={searchQuery}
                  onStatusChange={updateTaskStatus}
                  onEdit={(id) => navigate(`/tasks/edit/${id}`)}
                  onDelete={deleteTask}
                  userRole={userRole}
                  registeredUsers={registeredUsers}
                />
              )
            } />
            <Route path="*" element={<Navigate to="/tasks" />} />
          </Routes>
        </main>

      </div>
    </Layout>
  );
}
