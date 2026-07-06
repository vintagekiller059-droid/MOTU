import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Conversation } from '../types/chat';
import { formatDistanceToNow } from '../utils/date';

export default function ConversationSidebar() {
  const {
    conversations,
    currentConversationId,
    sidebarOpen,
    loadConversations,
    selectConversation,
    createNewConversation,
    removeConversation,
    toggleSidebar,
  } = useChatStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    setDeletingId(id);
    await removeConversation(id);
    setDeletingId(null);
  };

  const handleNewChat = async () => {
    await createNewConversation();
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-0 z-40 h-full w-10 bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition-colors"
        title="Open sidebar"
      >
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Conversations</h2>
          <button onClick={toggleSidebar} className="p-1 hover:bg-slate-800 rounded transition-colors">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No conversations yet.<br />Start a new chat!
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === currentConversationId}
              isDeleting={conv.id === deletingId}
              onSelect={() => selectConversation(conv.id)}
              onDelete={(e) => handleDelete(e, conv.id)}
            />
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 text-center">
        MOTU v3 — Local AI
      </div>
    </aside>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ConversationItem({ conversation, isActive, isDeleting, onSelect, onDelete }: ConversationItemProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isDeleting}
      className={`
        w-full text-left px-3 py-2.5 rounded-lg transition-all group relative
        ${isActive ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50 border border-transparent'}
        ${isDeleting ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-slate-300'}`}>
            {conversation.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {conversation.message_count} messages · {formatDistanceToNow(conversation.updated_at)}
          </p>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-all"
        title="Delete"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </button>
  );
}
