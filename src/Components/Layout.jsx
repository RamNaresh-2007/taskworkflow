import React from 'react';
import { GlobalHeader } from './GlobalHeader';
import { GlobalFooter } from './GlobalFooter';
import { MouseTrailer } from './MouseTrailer';

export function Layout({ children, currentUser, userRole, onLogout }) {
    return (
        <div className="layout-root">
            <MouseTrailer />
            <GlobalHeader currentUser={currentUser} userRole={userRole} onLogout={onLogout} />
            <div className="layout-content">
                {children}
            </div>
            <GlobalFooter currentUser={currentUser} />
        </div>
    );
}
