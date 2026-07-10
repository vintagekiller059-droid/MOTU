// MessageStream component
// Scrollable, bottom-aligned message list with streaming bubble + error banner

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { useSessionStore } from '../../stores/session-store'

export function MessageStream() {
  const { messages, isStreaming, streamingContent, sessionId, error, setError } =
    useSessionStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, streamingContent, error])

  const isEmpty = messages.length === 0 && !isStreaming && !error

  return (
    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4"
      style={{ contain: 'layout paint' }}
    >
      {isEmpty ? (
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Say something to begin.
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isStreaming &&
            (streamingContent ? (
              <MessageBubble
                message={{
                  id: 'streaming',
                  sessionId: sessionId ?? '',
                  role: 'assistant',
                  content: streamingContent,
                  createdAt: new Date().toISOString(),
                }}
              />
            ) : (
              <TypingIndicator />
            ))}

          {error && (
            <div
              className="glass-card flex items-start gap-2.5 px-4 py-3"
              style={{
                borderColor: 'var(--color-status-error)',
                background: 'var(--color-status-error-dim)',
              }}
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: 'var(--color-status-error)' }}
              />
              <div className="flex-1">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="mt-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--text-accent)' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  )
}