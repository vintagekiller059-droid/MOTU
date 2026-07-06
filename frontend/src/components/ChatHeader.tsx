import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { checkHealth } from '../services/api';

type ConnectionStatus = 'offline' | 'no-ai' | 'online';

export default function ChatHeader() {
  const [status, setStatus] = useState<ConnectionStatus>('offline');
  const { currentConversationId, conversations, sidebarOpen } = useChatStore();

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  useEffect(() => {
    const check = async () => {
      try {
        const health = await checkHealth();
        setStatus(health.ollama ? 'online' : 'no-ai');
      } catch {
        setStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    offline: { color: 'bg-red-500', label: 'Offline' },
    'no-ai': { color: 'bg-yellow-500', label: 'No AI' },
    online: { color: 'bg-emerald-500', label: 'Online' },
  };

  const config = statusConfig[status];

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button 
            onClick={() => useChatStore.getState().toggleSidebar()}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${config.color} animate-pulse`} />
          <span className="text-sm font-medium text-slate-300">{config.label}</span>
        </div>
        {currentConversation && (
          <span className="text-sm text-slate-500 ml-2 truncate max-w-[200px]">
            — {currentConversation.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">MOTU v3</span>
      </div>
    </header>
  );
}
