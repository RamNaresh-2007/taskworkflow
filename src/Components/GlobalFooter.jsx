import React from 'react';
import './GlobalFooter.css';

export function GlobalFooter({ currentUser }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="global-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <p className="copyright">&copy; {currentYear}</p>
                    <p className="version">v2.4.0 (Stable)</p>
                </div>
                <div className="footer-links">
                    {currentUser && (
                        <>
                            <span className="footer-link" style={{ color: 'var(--text-faint)' }}>Logged in as {currentUser.email}</span>
                            <span className="dot-sep">&middot;</span>
                        </>
                    )}
                    <a href="#" className="footer-link">Documentation</a>
                    <span className="dot-sep">&middot;</span>
                    <a href="#" className="footer-link">API Connect</a>
                    <span className="dot-sep">&middot;</span>
                    <a href="#" className="footer-link">Privacy Info</a>
                </div>
            </div>
            <div className="footer-glow-bar"></div>
        </footer>
    );
}
