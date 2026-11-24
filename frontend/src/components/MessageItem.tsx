import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="user-msg-row">
        <div className="user-bubble">{message.content}</div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="error-msg-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{message.content}</span>
      </div>
    );
  }

  const meta = message.metadata;
  const isCache = meta?.resolution_source === 'LLM_CACHE';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="assistant-msg-row">
      <div className="assistant-avatar" title="Rohit AI">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>

      <div className="assistant-body" data-testid="assistant-message">
        <div className="assistant-header-name">Rohit AI</div>
        
        <div className="assistant-text-content">
          {message.content}
        </div>

        {meta && (
          <div className="assistant-metadata-bar">
            {/* Exactly LIVE_INFERENCE or LLM_CACHE */}
            <span
              className={`meta-pill ${isCache ? 'source-cache' : 'source-live'}`}
              data-testid="meta-source"
            >
              {isCache ? '⚡ ' : '🟢 '}
              {meta.resolution_source}
            </span>

            {/* The model value */}
            <span className="meta-pill" data-testid="meta-model">
              {meta.model}
            </span>

            {/* Latency, e.g. 812 ms */}
            <span className="meta-pill" data-testid="meta-latency">
              {meta.latency_ms} ms
            </span>

            {/* The input_tokens integer */}
            <span className="meta-pill" title="Prompt input tokens">
              in: <span data-testid="meta-input-tokens">{meta.input_tokens}</span>
            </span>

            {/* The output_tokens integer */}
            <span className="meta-pill" title="Completion output tokens">
              out: <span data-testid="meta-output-tokens">{meta.output_tokens}</span>
            </span>

            {/* Key ID & Fallback Attempts */}
            {meta.key_id ? (
              <span className={`meta-pill ${meta.fallback_attempts > 0 ? 'failover-alert' : ''}`}>
                key: {meta.key_id}
                {meta.fallback_attempts > 0 && ` (${meta.fallback_attempts} fallback)`}
              </span>
            ) : (
              <span className="meta-pill">key: null</span>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem'
              }}
              title="Copy message"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
