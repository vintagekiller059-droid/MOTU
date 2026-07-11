export function ChatPanel() {
  return (
    <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 text-gray-400">
        Chat messages will appear here
      </div>
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
          />
          <button className="rounded-lg bg-emerald-500 px-4 py-2 text-white">Send</button>
        </div>
      </div>
    </main>
  )
}