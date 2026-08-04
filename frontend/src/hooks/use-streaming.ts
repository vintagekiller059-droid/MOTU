import { useState, useCallback, useRef } from 'react';
import { useSessionStore } from '../stores/session-store';
import { useCoreStore } from '../stores/core-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addMessage = useSessionStore((s) => s.addMessage);
  const appendToken = useSessionStore((s) => s.appendToken);
  const finalizeMessage = useSessionStore((s) => s.finalizeMessage);
  const currentSessionId = useSessionStore((s) => s.currentSessionId);
  const setActiveModules = useCoreStore((s) => s.setActiveModules);
  const setPhase = useCoreStore((s) => s.setPhase);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSessionId) { setError('No active session'); return; }

    setIsStreaming(true);
    setError(null);

    addMessage({ id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() });

    const assistantMessageId = crypto.randomUUID();
    addMessage({ id: assistantMessageId, role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() });

    try {
      abortRef.current = new AbortController();
      const response = await fetch(`${API_BASE}/api/v1/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ session_id: currentSessionId, message: content }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            console.log('[MOTU] SSE:', event);

            if (event.phase === 'activating' && event.modules) {
              setActiveModules(event.modules);
              setPhase('activating');
            }
            if (event.phase === 'transmitting') setPhase('transmitting');
            if (event.phase === 'core-processing') setPhase('core-processing');
            if (event.phase === 'answering') setPhase('answering');
            if (event.phase === 'idle') setPhase('idle');

            if (event.token !== undefined) appendToken(assistantMessageId, event.token);
            if (event.done) { if (event.timings) console.log('[MOTU] Timings:', event.timings); finalizeMessage(assistantMessageId); }
            if (event.error) { setError(event.error); finalizeMessage(assistantMessageId); }
          } catch (parseErr) {
            console.warn('[MOTU] Parse error:', jsonStr);
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
      setPhase('idle');
    }
  }, [currentSessionId, addMessage, appendToken, finalizeMessage, setActiveModules, setPhase]);

  const abort = useCallback(() => { abortRef.current?.abort(); }, []);

  return { sendMessage, isStreaming, error, abort };
};