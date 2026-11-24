import React, { useState, useEffect } from 'react';
import { ChatMessage, HealthStatus, ChatResponsePayload } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { SystemPromptModal } from './components/SystemPromptModal';

function generateSessionId(): string {
  const rand = Math.random().toString(16).substring(2, 10);
  return `s-${rand}`;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://rohit-ai-chatbot-fmp2.onrender.com');

export const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isSystemModalOpen, setIsSystemModalOpen] = useState<boolean>(false);
  const [simulateFailure, setSimulateFailure] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Initialize a new session on page load (Mandatory Assignment Requirement)
  useEffect(() => {
    const newId = generateSessionId();
    setSessionId(newId);
    
    // Load stored session IDs from localStorage
    const saved = localStorage.getItem('rohit_ai_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSessions([newId, ...parsed.filter((s) => s !== newId)].slice(0, 20));
        }
      } catch (_) {
        setSessions([newId]);
      }
    } else {
      setSessions([newId]);
    }

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
    const newId = generateSessionId();
    setSessionId(newId);
    setMessages([]);
    setSessions((prev) => {
      const updated = [newId, ...prev.filter((s) => s !== newId)].slice(0, 20);
      localStorage.setItem('rohit_ai_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectSession = async (sid: string) => {
    if (sid === sessionId) return;
    setSessionId(sid);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sid}/messages`);
      if (res.ok) {
        const data = await res.json();
        const loaded: ChatMessage[] = (data.messages || []).map((m: any, idx: number) => ({
          id: `loaded-${idx}`,
          role: m.role,
          content: m.content,
          metadata: m.metadata,
          timestamp: new Date().toISOString(),
        }));
        setMessages(loaded);
      } else {
        setMessages([]);
      }
    } catch (_) {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
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

        // Add error message into chat stream - never show blank screen
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
        content: `Connection Error: ${err.message || 'Unable to reach backend gateway'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatgpt-layout">
      {/* ChatGPT-style Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        currentSessionId={sessionId}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewSession}
        health={health}
        onOpenSystemPrompt={() => setIsSystemModalOpen(true)}
      />

      {/* Main Chat Interface */}
      <div className="main-chat-area">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onNewSession={handleNewSession}
          simulateFailure={simulateFailure}
          onSelectSimulateFailure={setSimulateFailure}
        />

        {simulateFailure && (
          <div className="sim-alert-banner">
            <span>
              🧪 <strong>Test Hook Active:</strong> <code>X-Simulate-Failure: {simulateFailure}</code>
            </span>
            <button
              onClick={() => setSimulateFailure('')}
              style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Turn Off
            </button>
          </div>
        )}

        <MessageList
          messages={messages}
          onSelectSamplePrompt={handleSendMessage}
          isLoading={isLoading}
        />

        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>

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
