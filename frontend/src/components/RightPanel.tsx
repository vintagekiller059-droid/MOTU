import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/app-store';
import { useUIStore } from '../stores/ui-store';
import { apiClient } from '../lib/api-client';
import { ChatUI } from './chat/ChatUI';

export const RightPanel: React.FC = () => {
  const {
    messages,
    currentSessionId,
    isStreaming,
    setIsStreaming,
    addMessage,
    appendToMessage,
    setStreamingMessageId,
    setCurrentSessionId,
  } = useChatStore();

  const { setMode } = useUIStore();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Safety reset
  useEffect(() => {
    setIsStreaming(false);
    setMode('idle');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    if (shouldAutoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, shouldAutoScroll]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  }, []);

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!input.trim() || isStreaming) return;

      const userText = input.trim();
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      addMessage({
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: now,
      });

      setInput('');
      setIsStreaming(true);
      setMode('thinking');
      setShouldAutoScroll(true);

      try {
        const response = await fetch(apiClient.streamChatUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            session_id: currentSessionId,
            message: userText,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let assistantMsgId: string | null = null;
        let hasReceivedToken = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;

            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.error) {
                addMessage({
                  id: `error-${Date.now()}`,
                  sender: 'motu',
                  text: `Error: ${event.error}`,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                });
                break;
              }

              if (event.token !== undefined) {
                if (!hasReceivedToken) {
                  hasReceivedToken = true;
                  setMode('speaking');
                  assistantMsgId = `assistant-${Date.now()}`;
                  addMessage({
                    id: assistantMsgId,
                    sender: 'motu',
                    text: event.token,
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  });
                  setStreamingMessageId(assistantMsgId);
                } else {
                  appendToMessage(assistantMsgId, event.token);
                }
              }

              if (event.done) {
                if (event.session_id) {
                  setCurrentSessionId(event.session_id);
                }
                break;
              }
            } catch {
              // Ignore malformed lines
            }
          }
        }
      } catch (err) {
        addMessage({
          id: `error-${Date.now()}`,
          sender: 'motu',
          text:
            err instanceof Error
              ? err.message
              : 'Connection failed. Is the backend running?',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      } finally {
        setIsStreaming(false);
        setStreamingMessageId(null);
        setMode('idle');
      }
    },
    [
      input,
      isStreaming,
      currentSessionId,
      setMode,
      setIsStreaming,
      setCurrentSessionId,
      setStreamingMessageId,
      addMessage,
      appendToMessage,
      setShouldAutoScroll,
    ]
  );

  return (
    /* Strictly fixes the 380px width & right side alignment WITHOUT border lines */
    <aside className="w-[380px] min-w-[380px] max-w-[380px] h-full bg-transparent flex flex-col p-3 z-20 shrink-0 box-border overflow-hidden">
      <ChatUI
        messages={messages}
        isStreaming={isStreaming}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        chatContainerRef={chatContainerRef}
        chatEndRef={chatEndRef}
        onScroll={handleScroll}
        backendOnline={false}
        ollamaOnline={false}
      />
    </aside>
  );
};

export default RightPanel;