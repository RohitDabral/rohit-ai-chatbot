import React from 'react';
import { ChatMessage } from '../types';

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  if (message.role === 'user') {
    return (
      <div className="message-wrapper user">
        <div className="user-bubble">{message.content}</div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="message-wrapper error">
        <div className="error-container">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>{message.content}</div>
        </div>
      </div>
    );
  }

  // Assistant message with exact contract requirements
  const meta = message.metadata;
  const isCache = meta?.resolution_source === 'LLM_CACHE';

  return (
    <div className="message-wrapper assistant">
      <div className="assistant-container" data-testid="assistant-message">
        <div className="assistant-content">{message.content}</div>

        {meta && (
          <div className="meta-panel">
            {/* Exactly LIVE_INFERENCE or LLM_CACHE */}
            <span
              className={`meta-chip ${isCache ? 'source-cache' : 'source-live'}`}
              data-testid="meta-source"
            >
              {isCache ? '⚡ ' : '🟢 '}
              {meta.resolution_source}
            </span>

            {/* The model value */}
            <span className="meta-chip" data-testid="meta-model">
              {meta.model}
            </span>

            {/* Latency, e.g. 812 ms */}
            <span className="meta-chip latency" data-testid="meta-latency">
              {meta.latency_ms} ms
            </span>

            {/* The input_tokens integer */}
            <span className="meta-chip" title="Prompt Tokens">
              in: <span data-testid="meta-input-tokens">{meta.input_tokens}</span>
            </span>

            {/* The output_tokens integer */}
            <span className="meta-chip" title="Completion Tokens">
              out: <span data-testid="meta-output-tokens">{meta.output_tokens}</span>
            </span>

            {/* Provider Key & Fallback Indicator */}
            {meta.key_id ? (
              <span className={`meta-chip ${meta.fallback_attempts > 0 ? 'key-fallback' : ''}`}>
                key: {meta.key_id}
                {meta.fallback_attempts > 0 && ` (${meta.fallback_attempts} fallback)`}
              </span>
            ) : (
              <span className="meta-chip">key: null</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
