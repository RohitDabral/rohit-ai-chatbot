import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  onSelectSamplePrompt: (prompt: string) => void;
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectSamplePrompt,
  isLoading,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="welcome-container">
          <div className="welcome-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            LiteLLM Resilient Architecture
          </div>
          <h1 className="welcome-title">Full-Stack LLM Chatbot</h1>
          <p className="welcome-desc">
            Equipped with multi-turn conversation memory, SQLite persistence,
            automatic API key failover, and built-in response caching.
          </p>

          <div className="sample-prompts">
            <button
              className="sample-prompt-btn"
              onClick={() => onSelectSamplePrompt('What is the capital of France?')}
            >
              🇫🇷 <strong>What is the capital of France?</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Test cache & quick reply
              </div>
            </button>
            <button
              className="sample-prompt-btn"
              onClick={() => onSelectSamplePrompt('Explain quantum computing in 2 simple sentences.')}
            >
              ⚛️ <strong>Explain quantum computing</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Test token usage & latency
              </div>
            </button>
            <button
              className="sample-prompt-btn"
              onClick={() => onSelectSamplePrompt('Write a Python function to check if a string is a palindrome.')}
            >
              🐍 <strong>Python palindrome function</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Multi-line code completion
              </div>
            </button>
            <button
              className="sample-prompt-btn"
              onClick={() => onSelectSamplePrompt('What was the first question I asked you?')}
            >
              🧠 <strong>Check conversation memory</strong>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Verify multi-turn SQLite context
              </div>
            </button>
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="message-wrapper assistant">
          <div className="assistant-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <div className="spinner" />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Generating response with LiteLLM...
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
