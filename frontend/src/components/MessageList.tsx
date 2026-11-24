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

  return (
    <div className="messages-viewport">
      <div className="messages-content-wrapper">
        {messages.length === 0 ? (
          <div className="chatgpt-hero">
            <div className="hero-avatar">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="hero-title">What can I help with today?</h1>
            <p className="hero-subtitle">
              Hello! I am <strong>Rohit AI</strong>. Built with multi-turn memory,
              intelligent key failover, and millisecond response caching.
            </p>

            <div className="hero-prompts-grid">
              <div
                className="hero-prompt-card"
                onClick={() => onSelectSamplePrompt('What is the capital of France?')}
              >
                <div className="hero-prompt-title">🇫🇷 What is the capital of France?</div>
                <div className="hero-prompt-sub">Test live inference & instant cache hit</div>
              </div>

              <div
                className="hero-prompt-card"
                onClick={() => onSelectSamplePrompt('Explain quantum computing in 2 simple sentences.')}
              >
                <div className="hero-prompt-title">⚛️ Explain quantum computing</div>
                <div className="hero-prompt-sub">Inspect token tracking & server latency</div>
              </div>

              <div
                className="hero-prompt-card"
                onClick={() => onSelectSamplePrompt('Write a Python function to check if a string is a palindrome.')}
              >
                <div className="hero-prompt-title">🐍 Python palindrome function</div>
                <div className="hero-prompt-sub">Code synthesis with clean formatting</div>
              </div>

              <div
                className="hero-prompt-card"
                onClick={() => onSelectSamplePrompt('What was the first question I asked you?')}
              >
                <div className="hero-prompt-title">🧠 Check conversation context</div>
                <div className="hero-prompt-sub">Verify SQLite multi-turn memory</div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}

        {isLoading && (
          <div className="assistant-msg-row">
            <div className="assistant-avatar">
              <div className="spinner-sm" />
            </div>
            <div className="assistant-body">
              <div className="assistant-header-name">Rohit AI</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Thinking and generating reply...
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
