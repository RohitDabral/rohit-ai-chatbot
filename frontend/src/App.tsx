import React, { useState, useEffect } from 'react';
import { ChatMessage, HealthStatus, ChatResponsePayload } from './types';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { SystemPromptModal } from './components/SystemPromptModal';

// Generate a random session ID on every page load: e.g. s-7f3a4b91
function generateSessionId(): string {
  const rand = Math.random().toString(16).substring(2, 10);
  return `s-${rand}`;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isSystemModalOpen, setIsSystemModalOpen] = useState<boolean>(false);
  const [simulateFailure, setSimulateFailure] = useState<string>('');

  // Start new session on page load
  useEffect(() => {
    setSessionId(generateSessionId());
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data: HealthStatus = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.warn('Health check unreachable:', err);
    }
  };

  const handleNewSession = () => {
    setSessionId(generateSessionId());
    setMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (simulateFailure) {
        headers['X-Simulate-Failure'] = simulateFailure;
      }

      const payload: {
        session_id: string;
        message: string;
        system_prompt?: string;
      } = {
        session_id: sessionId,
        message: text,
      };
      if (systemPrompt.trim()) {
        payload.system_prompt = systemPrompt.trim();
      }

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorDetail = `Request failed with status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.detail) {
            errorDetail = typeof errJson.detail === 'string'
              ? errJson.detail
              : JSON.stringify(errJson.detail);
          }
        } catch (_) {}

        // Add error message to chat so user never gets a blank screen
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'error',
          content: `Error (${res.status}): ${errorDetail}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const data: ChatResponsePayload = await res.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        metadata: data.metadata,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'error',
        content: `Network or Server Connection Error: ${err.message || 'Unable to reach backend gateway'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Header
        sessionId={sessionId}
        health={health}
        onNewSession={handleNewSession}
        onOpenSystemPrompt={() => setIsSystemModalOpen(true)}
        simulateFailure={simulateFailure}
        onSelectSimulateFailure={setSimulateFailure}
      />

      {simulateFailure && (
        <div className="simulator-bar">
          <span>⚠️ Active Test Hook: <code>X-Simulate-Failure: {simulateFailure}</code></span>
          <button
            style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setSimulateFailure('')}
          >
            Reset
          </button>
        </div>
      )}

      <main className="chat-main">
        <MessageList
          messages={messages}
          onSelectSamplePrompt={handleSendMessage}
          isLoading={isLoading}
        />
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </main>

      <SystemPromptModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        systemPrompt={systemPrompt}
        onSave={setSystemPrompt}
      />
    </div>
  );
};

export default App;
