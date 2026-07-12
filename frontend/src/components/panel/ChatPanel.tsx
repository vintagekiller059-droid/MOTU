import { MessageStream } from '../chat/MessageStream'
import { InputOrbit } from '../chat/InputOrbit'

export function ChatPanel() {
  return (
    <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
      <MessageStream />
      <div className="px-6 pb-4">
        <InputOrbit />
      </div>
    </main>
  )
}