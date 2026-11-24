import React, { useState } from 'react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSave: (prompt: string) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  onSave,
}) => {
  const [prompt, setPrompt] = useState(systemPrompt);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">System Prompt Configuration</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Custom Session Prompt</label>
          <textarea
            data-testid="system-prompt-input"
            className="form-textarea"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. You are a senior Python software architect who gives concise code-first answers."
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            This prompt will override the gateway default system prompt for this active session.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Prompt</button>
        </div>
      </div>
    </div>
  );
};
