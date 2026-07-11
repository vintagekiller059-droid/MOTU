// InputOrbit component
// Input field that expands on focus — fixed bottom, glass styling

import { useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
import { useStreaming } from '../../hooks/use-streaming'
import { useSessionStore } from '../../stores/session-store'
import { useUIStore } from '../../stores/ui-store'

export function InputOrbit() {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { sendMessage, stopStreaming } = useStreaming()
  const isStreaming = useSessionStore((s) => s.isStreaming)
  const setInputFocused = useUIStore((s) => s.setInputFocused)

  const handleSend = () => {
    if (!value.trim() || isStreaming) return
    sendMessage(value)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div
      className="glass flex items-end gap-2 rounded-2xl px-4 py-2.5 transition-gpu"
      style={{ minHeight: 'var(--input-orbit-height)' }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        placeholder="Type your message..."
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm outline-none"
        style={{ color: 'var(--text-primary)', maxHeight: 120 }}
      />

      {isStreaming ? (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={stopStreaming}
          className="glass-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-gpu"
          style={{ color: 'var(--text-accent)' }}
          aria-label="Stop generating"
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSend}
          disabled={!value.trim()}
          className="glass-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-gpu disabled:opacity-30"
          style={{ color: 'var(--text-accent)' }}
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      )}
    </div>
  )
}