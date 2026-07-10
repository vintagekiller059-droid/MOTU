// SSE message parser for the chat token stream

export type StreamEvent =
  | { type: 'token'; content: string }
  | { type: 'done'; messageId: string }
  | { type: 'error'; code: string; message: string }

/**
 * Opens an SSE connection to the given URL and invokes callbacks as events
 * arrive. Returns an abort function to cancel the stream early.
 */
export function consumeChatStream(
  url: string,
  handlers: {
    onToken: (content: string) => void
    onDone: (messageId: string) => void
    onError: (code: string, message: string) => void
  },
): () => void {
  const controller = new AbortController()

  ;(async () => {
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok || !response.body) {
        handlers.onError('CONNECTION_FAILED', `Stream failed: ${response.status}`)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const chunk of lines) {
          const dataLine = chunk.split('\n').find((l) => l.startsWith('data: '))
          if (!dataLine) continue

          const raw = dataLine.slice(6)
          let parsed: { type: string; content?: string; message_id?: string; code?: string; message?: string }
          try {
            parsed = JSON.parse(raw)
          } catch {
            continue
          }

          if (parsed.type === 'token' && parsed.content !== undefined) {
            handlers.onToken(parsed.content)
          } else if (parsed.type === 'done' && parsed.message_id) {
            handlers.onDone(parsed.message_id)
          } else if (parsed.type === 'error') {
            handlers.onError(parsed.code ?? 'UNKNOWN', parsed.message ?? 'Unknown error')
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handlers.onError('STREAM_ERROR', (err as Error).message)
      }
    }
  })()

  return () => controller.abort()
}