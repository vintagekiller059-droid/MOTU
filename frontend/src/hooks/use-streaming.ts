// frontend/src/hooks/useStreaming.ts
import { useState, useCallback, useRef } from 'react';
import { useSessionStore } from '../stores/session-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addMessage = useSessionStore((s) => s.addMessage);
  const appendToken = useSessionStore((s) => s.appendToken);
  const finalizeMessage = useSessionStore((s) => s.finalizeMessage);
  const currentSessionId = useSessionStore((s) => s.currentSessionId);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSessionId) {
      setError('No active session');
      return;
    }

    setIsStreaming(true);
    setError(null);

    // Add user message immediately
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    });

    // Create placeholder assistant message for streaming
    const assistantMessageId = crypto.randomUUID();
    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    });

    console.log('[MOTU] ✓ SSE connected');

    try {
      abortRef.current = new AbortController();

      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: content,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);
              console.log('[MOTU] ✓ Token received:', event);

              if (event.token !== undefined) {
                appendToken(assistantMessageId, event.token);
                console.log('[MOTU] ✓ Store updated');
              }

              if (event.done) {
                console.log('[MOTU] ✓ Stream finished');
                finalizeMessage(assistantMessageId);
              }
            } catch (parseErr) {
              console.warn('[MOTU] Failed to parse SSE data:', jsonStr);
            }
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const event = JSON.parse(jsonStr);
              if (event.token !== undefined) {
                appendToken(assistantMessageId, event.token);
              }
              if (event.done) {
                finalizeMessage(assistantMessageId);
              }
            } catch { /* ignore */ }
          }
        }
      }

      finalizeMessage(assistantMessageId);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[MOTU] Stream aborted');
      } else {
        console.error('[MOTU] Streaming error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
      finalizeMessage(assistantMessageId);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [currentSessionId, addMessage, appendToken, finalizeMessage]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, isStreaming, error, abort };
};