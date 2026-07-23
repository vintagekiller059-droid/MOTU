// frontend/src/components/ChatPanel.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useStreaming } from '../hooks/useStreaming';
import { useSessionStore } from '../stores/session-store';
import { MessageStream } from './MessageStream';

export const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { sendMessage, isStreaming, error } = useStreaming();
  const currentSessionId = useSessionStore((s) => s.currentSessionId);
  const messages = useSessionStore((s) => s.messages);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    console.log('[MOTU] ✓ Send pressed');
    console.log('[MOTU] ✓ Request created');

    const content = input.trim();
    setInput('');

    await sendMessage(content);
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.role}`}
          >
            {msg.role === 'assistant' && msg.isStreaming ? (
              <MessageStream messageId={msg.id} />
            ) : (
              <div className="message-content">{msg.content}</div>
            )}
          </div>
        ))}
        {isStreaming && (
          <div className="message-bubble assistant streaming">
            <MessageStream messageId="streaming" />
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MOTU anything..."
          disabled={isStreaming}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </div>
    </div>
  );
};