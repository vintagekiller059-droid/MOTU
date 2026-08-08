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

  // Dynamic system metrics state
  const [backendOnline, setBackendOnline] = useState(false);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [cpuPercent, setCpuPercent] = useState(0);
  const [ramPercent, setRamPercent] = useState(0);

  // Poll system health via apiClient.health()
  useEffect(() => {
    let isMounted = true;

    const checkSystemStatus = async () => {
      try {
        const healthData = await apiClient.health();

        if (isMounted && healthData) {
          setBackendOnline(true);
          setOllamaOnline(Boolean(healthData.ollamaConnected));
          setCpuPercent(Number(healthData.cpuPercent ?? 0));
          setRamPercent(Number(healthData.memoryPercent ?? 0));
        }
      } catch {
        if (isMounted) {
          setBackendOnline(false);
          setOllamaOnline(false);
          setCpuPercent(0);
          setRamPercent(0);
        }
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Reset streaming state on component mount
  useEffect(() => {
    setIsStreaming(false);
    setMode('idle');
  }, [setIsStreaming, setMode]);

  // Auto-scroll logic
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

      const controller = new AbortController();
      // Timeout safety: Cancel request after 30 seconds if it hangs
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const streamUrl =
          typeof apiClient.streamChatUrl === 'function'
            ? apiClient.streamChatUrl()
            : '/api/v1/chat/stream';

        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream, application/json',
          },
          body: JSON.stringify({
            session_id: currentSessionId,
            message: userText,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server returned status HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';

        // Standard JSON Fallback Handling
        if (contentType.includes('application/json')) {
          const jsonRes = await response.json();
          const assistantMsgId = `assistant-${Date.now()}`;
          const responseText =
            jsonRes.response || jsonRes.message || jsonRes.text || 'No response';

          if (jsonRes.session_id) {
            setCurrentSessionId(jsonRes.session_id);
          }

          addMessage({
            id: assistantMsgId,
            sender: 'motu',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
        } else {
          // Streaming Response Parsing
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream available');

          const decoder = new TextDecoder();
          let buffer = '';
          let assistantMsgId: string | null = null;
          let hasReceivedToken = false;

          try {
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
                if (jsonStr === '[DONE]') break;

                try {
                  const event = JSON.parse(jsonStr);

                  if (event.error) {
                    throw new Error(event.error);
                  }

                  const token =
                    event.token ??
                    event.content ??
                    event.response ??
                    (typeof event === 'string' ? event : undefined);

                  if (token !== undefined) {
                    if (!hasReceivedToken) {
                      hasReceivedToken = true;
                      setMode('speaking');
                      assistantMsgId = `assistant-${Date.now()}`;
                      addMessage({
                        id: assistantMsgId,
                        sender: 'motu',
                        text: token,
                        timestamp: new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      });
                      setStreamingMessageId(assistantMsgId);
                    } else if (assistantMsgId) {
                      appendToMessage(assistantMsgId, token);
                    }
                  }

                  if (event.done && event.session_id) {
                    setCurrentSessionId(event.session_id);
                  }
                } catch {
                  // Fallback for raw non-JSON text stream
                  if (!hasReceivedToken) {
                    hasReceivedToken = true;
                    setMode('speaking');
                    assistantMsgId = `assistant-${Date.now()}`;
                    addMessage({
                      id: assistantMsgId,
                      sender: 'motu',
                      text: jsonStr,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    });
                    setStreamingMessageId(assistantMsgId);
                  } else if (assistantMsgId) {
                    appendToMessage(assistantMsgId, jsonStr);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      } catch (err: any) {
        const errorMessage =
          err.name === 'AbortError'
            ? 'Response timed out. Please try sending your message again.'
            : err instanceof Error
            ? err.message
            : 'Connection failed. Is the backend running?';

        addMessage({
          id: `error-${Date.now()}`,
          sender: 'motu',
          text: errorMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      } finally {
        // ALWAYS re-enable the user input and reset modes
        clearTimeout(timeoutId);
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
    ]
  );

  return (
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
        backendOnline={backendOnline}
        ollamaOnline={ollamaOnline}
        cpuPercent={cpuPercent}
        ramPercent={ramPercent}
      />
    </aside>
  );
};

export default RightPanel;