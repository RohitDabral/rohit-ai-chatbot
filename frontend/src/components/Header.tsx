import React from 'react';
import { HealthStatus } from '../types';

interface HeaderProps {
  sessionId: string;
  health: HealthStatus | null;
  onNewSession: () => void;
  onOpenSystemPrompt: () => void;
  simulateFailure: string;
  onSelectSimulateFailure: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sessionId,
  health,
  onNewSession,
  onOpenSystemPrompt,
  simulateFailure,
  onSelectSimulateFailure,
}) => {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="brand-title">Lyftr AI</div>
          <div className="brand-subtitle">Session: {sessionId}</div>
        </div>
      </div>

      <div className="header-controls">
        {health && (
          <div className="health-pill" title="Gateway & SQLite Health">
            <span className="health-dot" />
            <span>{health.keys_configured} Keys</span>
            <span>•</span>
            <span>Cache {health.cache_enabled ? 'ON' : 'OFF'}</span>
          </div>
        )}

        <button 
          className="btn-secondary"
          onClick={onOpenSystemPrompt}
          title="Configure System Prompt"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          System Prompt
        </button>

        <button 
          className="btn-secondary"
          onClick={onNewSession}
          title="Start a new chat session"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Chat
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select 
            className="simulator-select"
            value={simulateFailure}
            onChange={(e) => onSelectSimulateFailure(e.target.value)}
            title="Simulate provider error via X-Simulate-Failure header"
          >
            <option value="">Simulation: Off</option>
            <option value="key_1=429">Simulate: key_1=429 (Rate Limit)</option>
            <option value="key_1=500">Simulate: key_1=500 (Server Error)</option>
            <option value="*=429">Simulate: *=429 (All Fail)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
