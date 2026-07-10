// MessageBubble component
// Individual message with glass card styling — matches MOTU design tokens

import { memo } from 'react'
import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
}

function MessageBubbleImpl({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex w-full animate-message-enter ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[75%] items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span
          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            background: isUser ? 'var(--user-dot)' : 'var(--ai-dot)',
            boxShadow: isUser ? 'none' : 'var(--glow-accent)',
          }}
        />
        <div
          className="glass-card px-4 py-2.5"
          style={{ color: 'var(--text-primary)' }}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleImpl)