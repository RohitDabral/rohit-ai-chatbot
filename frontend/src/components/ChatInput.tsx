import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    // Send message and clear input immediately as required by assignment contract
    onSendMessage(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="floating-input-zone">
      <form className="floating-prompt-box" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          data-testid="chat-input"
          className="prompt-textarea"
          placeholder="Message Rohit AI..."
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />

        <div className="prompt-box-footer">
          <div className="prompt-tools-left">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Enter ↵ to send • Shift+Enter for newline
            </span>
          </div>

          <button
            type="submit"
            data-testid="send-button"
            className="send-button-circle"
            disabled={!input.trim() || disabled}
            title="Send Message"
          >
            {disabled ? (
              <div className="spinner-sm" style={{ borderTopColor: '#000' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            )}
          </button>
        </div>
      </form>

      <div className="input-disclaimer-text">
        Rohit AI can make mistakes. Verify important information. Powered by LiteLLM Gateway.
      </div>
    </div>
  );
};
