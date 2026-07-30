import React, { useState, useEffect, useCallback, memo } from 'react';
import { MessageSquare, Plus, Trash2, Cpu, Activity, Wifi, WifiOff } from 'lucide-react';
import { useSessionStore } from '../stores/app-store';
import { useModelStore } from '../stores/app-store';
import { useAppUIStore } from '../stores/app-store';
import { useChatStore } from '../stores/app-store';
import { useSystemStore } from '../stores/system-store';
import { apiClient } from '../lib/api-client';

// ── Memoized Session Item ──
const SessionItem = memo(({
  session,
  isActive,
  onSelect,
  onDelete,
  formatTime,
}: {
  session: { id: string; title: string; model: string; updatedAt: string; messageCount: number };
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (iso: string) => string;
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => onDelete(session.id), 250);
  }, [session.id, onDelete]);

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-250 border ${
        isActive
          ? 'bg-cyan-500/[0.08] border-cyan-500/30 shadow-[0_0_16px_rgba(0,229,255,0.06)]'
          : 'bg-white/[0.02] border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
      } ${isDeleting ? 'opacity-0 -translate-x-5 scale-95' : ''}`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
      )}
      <div className="flex items-start justify-between pl-2">
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium truncate transition-colors ${isActive ? 'text-cyan-100' : 'text-slate-300 group-hover:text-slate-200'}`}>
            {session.title}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[9px] text-slate-500 font-mono">{session.messageCount} msgs</span>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-600" />
            <span className="text-[9px] text-slate-600">{formatTime(session.updatedAt)}</span>
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5 font-mono">{session.model}</div>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-slate-600 transition-all duration-200 flex-shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {showDelete && !isDeleting && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 z-10 animate-in fade-in duration-150">
          <span className="text-[10px] text-slate-300">Delete?</span>
          <button
            onClick={handleDelete}
            className="px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 text-[10px] hover:bg-red-500/25 transition-colors border border-red-500/20"
          >
            Delete
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(false); }}
            className="px-2.5 py-1 rounded-md bg-white/5 text-slate-400 text-[10px] hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
});
SessionItem.displayName = 'SessionItem';

export const Sidebar: React.FC = () => {
  const { sessions, setSessions, addSession, removeSession } = useSessionStore();
  const { models, selectedModel, setModels, setSelectedModel } = useModelStore();
  const { sidebarTab, setSidebarTab, setIsLoading, setError, backendOnline, ollamaOnline, setBackendOnline, setOllamaOnline } = useAppUIStore();
  const { setMessages, setCurrentSessionId } = useChatStore();
  const { setMetrics, setBackendOnline: setSysBackendOnline, setOllamaOnline: setSysOllamaOnline } = useSystemStore();

  const [isExpanded, setIsExpanded] = useState(false);

  // Health polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiClient.health();
        setBackendOnline(true);
        setOllamaOnline(health.ollamaConnected);
        setSysBackendOnline(true);
        setSysOllamaOnline(health.ollamaConnected);
        setMetrics(health.cpuPercent || 0, health.memoryPercent || 0);
      } catch {
        setBackendOnline(false);
        setOllamaOnline(false);
        setSysBackendOnline(false);
        setSysOllamaOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [setBackendOnline, setOllamaOnline, setSysBackendOnline, setSysOllamaOnline, setMetrics]);

  useEffect(() => {
    loadSessions();
    loadModels();
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.listSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [setSessions, setIsLoading, setError]);

  const loadModels = useCallback(async () => {
    try {
      const data = await apiClient.listModels();
      setModels(data);
      const active = await apiClient.getActiveModel();
      setSelectedModel(active);
    } catch (err) {
      console.warn('Failed to load models:', err);
    }
  }, [setModels, setSelectedModel]);

  const createNewChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await apiClient.createSession({ title: 'New Chat', model: selectedModel });
      addSession(session);
      setCurrentSessionId(session.id);
      setMessages([]);
      setSidebarTab('sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, addSession, setCurrentSessionId, setMessages, setSidebarTab, setIsLoading, setError]);

  const selectSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const session = await apiClient.getSession(sessionId);
      setCurrentSessionId(sessionId);
      const chatMessages = session.messages.map((m: any) => ({
        id: m.id,
        sender: m.role === 'user' ? 'user' as const : 'motu' as const,
        text: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setMessages(chatMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentSessionId, setMessages, setIsLoading, setError]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      await apiClient.deleteSession(sessionId);
      removeSession(sessionId);
      const currentId = useChatStore.getState().currentSessionId;
      if (currentId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setIsLoading(false);
    }
  }, [removeSession, setCurrentSessionId, setMessages, setIsLoading, setError]);

  const formatTime = useCallback((iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  const currentSessionId = useChatStore((state) => state.currentSessionId);

  const tabs = [
    { id: 'sessions' as const, icon: MessageSquare, label: 'Chats' },
    { id: 'models' as const, icon: Cpu, label: 'Models' },
  ];

  return (
    <>
      {/* Collapsed Dock */}
      <div 
        className="fixed left-0 top-0 h-full w-20 z-40 flex flex-col items-center py-6 gap-6 bg(rgba(5,8,20,0.25)) backdrop-blur-[16px] border-r border-white/[0.04]"
        onMouseEnter={() => setIsExpanded(true)}
      >
        <div className="w-10 h-10 rounded-full border border-[#00E5FF]/30 flex items-center justify-center font-mono text-xs text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.15)] bg-black/40">
          M
        </div>

        <div className="flex flex-col gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = sidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setSidebarTab(tab.id); setIsExpanded(true); }}
                title={tab.label}
                className={`relative p-3 rounded-xl transition-all duration-300 group ${isSelected ? 'text-[#00E5FF]' : 'text-[#8EA7C2] hover:text-white'}`}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl shadow-[0_0_12px_rgba(0,229,255,0.1)]" />
                )}
                <Icon className="w-4 h-4 relative z-10 transition-all duration-300" />
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5" title={backendOnline ? 'Backend Online' : 'Backend Offline'}>
            {backendOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
          </div>
          <div className="flex items-center gap-1.5" title={ollamaOnline ? 'Ollama Online' : 'Ollama Offline'}>
            <Activity className={`w-3 h-3 ${ollamaOnline ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>
        </div>
      </div>

      {/* Expanded Panel */}
      <div
        className={`fixed left-20 top-0 h-full w-[280px] z-30 bg(rgba(5,8,20,0.7)) backdrop-blur-[24px] border-r border-white/[0.04] flex flex-col transition-all duration-300 ease-out ${isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
          <div>
            <h3 className="text-[10px] tracking-[0.2em] text-cyan-400 font-mono uppercase">
              {sidebarTab === 'sessions' ? 'Conversations' : 'Model Registry'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-red-400'}`} />
              <span className="text-[9px] text-slate-500 font-mono">
                {backendOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
              </span>
            </div>
          </div>
          {sidebarTab === 'sessions' && (
            <button
              onClick={createNewChat}
              className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/10">
          {sidebarTab === 'sessions' && (
            <>
              {sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                  <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                  <div className="text-xs">No conversations</div>
                  <div className="text-[10px] mt-1 opacity-50">Start a new chat</div>
                </div>
              )}
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={currentSessionId === session.id}
                  onSelect={selectSession}
                  onDelete={deleteSession}
                  formatTime={formatTime}
                />
              ))}
            </>
          )}

          {sidebarTab === 'models' && (
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.name}
                  onClick={() => setSelectedModel(model.name)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-250 border ${
                    selectedModel === model.name
                      ? 'bg-cyan-500/[0.08] border-cyan-500/30 shadow-[0_0_16px_rgba(0,229,255,0.06)]'
                      : 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${selectedModel === model.name ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {model.name}
                    </span>
                    {selectedModel === model.name && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00E5FF]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-slate-500 font-mono">{model.parameterCount}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-slate-600" />
                    <span className="text-[9px] text-slate-600">{(model.size / 1e9).toFixed(2)} GB</span>
                  </div>
                  <div className="text-[9px] text-slate-600 mt-0.5 font-mono uppercase">{model.format}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;