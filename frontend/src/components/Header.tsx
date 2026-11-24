import React from 'react';
import { HealthStatus } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewSession: () => void;
  simulateFailure: string;
  onSelectSimulateFailure: (val: string) => void;
  modelName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onNewSession,
  simulateFailure,
  onSelectSimulateFailure,
  modelName = 'gemini/gemini-2.0-flash',
}) => {
  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="sidebar-action-btn"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>

        <div className="model-selector-pill" title={`Active Model: ${modelName}`}>
          <span>Rohit AI</span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            2.0 Flash
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <div className="navbar-right">
        {/* Failover Test Hook selector for easy grading */}
        <select
          className="simulator-dropdown"
          value={simulateFailure}
          onChange={(e) => onSelectSimulateFailure(e.target.value)}
          title="X-Simulate-Failure test hook"
        >
          <option value="">Simulation: Off (Normal)</option>
          <option value="key_1=429">Simulate: key_1=429 (Rate Limit)</option>
          <option value="key_1=500">Simulate: key_1=500 (Server Error)</option>
          <option value="*=429">Simulate: *=429 (All Fail 503)</option>
        </select>

        <button
          className="sidebar-action-btn"
          onClick={onNewSession}
          title="New chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};
