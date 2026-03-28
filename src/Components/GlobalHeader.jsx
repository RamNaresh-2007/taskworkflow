import React, { useState, useEffect } from 'react';
import './GlobalHeader.css';
import logoUrl from '../assets/logo.png';

export function GlobalHeader({ currentUser, userRole, onLogout }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return () => clearInterval(timer);
  }, []);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  return (
    <header className="global-header">
      <div className="global-header-brand">
        <div className="brand-logo" style={{ overflow: 'hidden' }}>
          <img src={logoUrl} alt="Portal Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span className="brand-text">Taskwork Flow Portal</span>
      </div>

      <div className="global-header-right">
        {currentUser && (
          <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '16px' }}>
            <span style={{ fontSize: '0.85rem' }}>Hi, <strong>{currentUser.name}</strong></span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', border: '1px solid var(--border-glass)', borderRadius: '10px', textTransform: 'uppercase' }}>{userRole}</span>
            <button
              onClick={onLogout}
              style={{
                marginLeft: '8px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer',
                border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: '4px', background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444'
              }}
            >
              Log out
            </button>
          </div>
        )}
        <select
          onChange={handleThemeChange}
          defaultValue={localStorage.getItem('app-theme') || 'light'}
          className="theme-selector"
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(0,0,0,0.1)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="ocean">Ocean Theme</option>
          <option value="sunset">Sunset Theme</option>
        </select>
        <div className="system-status">
          <span className="status-dot"></span>
          <span className="status-text">System Online</span>
        </div>
        <div className="live-clock">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </header>
  );
}
