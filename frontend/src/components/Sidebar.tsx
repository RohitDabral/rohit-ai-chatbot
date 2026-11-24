import React from 'react';
import { HealthStatus } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSessionId: string;
  sessions: string[];
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  health: HealthStatus | null;
  onOpenSystemPrompt: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentSessionId,
  sessions,
  onSelectSession,
  onNewChat,
  health,
  onOpenSystemPrompt,
}) => {
  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="rohit-avatar-sm">R</div>
          <span>Rohit AI</span>
        </div>
        <button
          className="sidebar-action-btn"
          onClick={onToggle}
          title="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New chat</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⌘N</span>
      </button>

      <div className="sidebar-section-title">Recent Chats</div>

      <div className="sessions-list">
        {sessions.map((sid) => (
          <button
            key={sid}
            className={`session-item ${sid === currentSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(sid)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="session-title">{sid}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        {health && (
          <div className="health-status-box" title="LiteLLM Gateway Health">
            <span className="pulse-dot" />
            <span>{health.keys_configured} Keys Active</span>
            <span>•</span>
            <span>Cache {health.cache_enabled ? 'ON' : 'OFF'}</span>
          </div>
        )}

        <button
          className="session-item"
          onClick={onOpenSystemPrompt}
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>System Prompt</span>
        </button>
      </div>
    </aside>
  );
};
