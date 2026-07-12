import React, { useEffect, useRef } from 'react';
import { useSessionStore } from '../../stores/session-store';
import { MessageBubble } from './MessageBubble';
import { Terminal } from 'lucide-react';

export const ConversationCanvas: React.FC = () => {
  const { messages, isStreaming, streamingContent } = useSessionStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 py-6 flex flex-col justify-between">
      {messages.length === 0 && !streamingContent ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-40 space-y-3 select-none pointer-events-none">
          <Terminal className="w-8 h-8 text-brand-cyan animate-pulse" />
          <div className="text-center space-y-1">
            <p className="font-mono text-xs tracking-widest text-brand-cyan">NEURAL WORKSPACE READY</p>
            <p className="text-[11px] text-slate-400">Press tab or click below to interface with Core.</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {/* Active Server-Sent token streaming layer representation */}
          {streamingContent && (
            <MessageBubble 
              message={{
                id: 'streaming-active',
                role: 'assistant',
                content: streamingContent,
                created_at: new Date().toISOString()
              }} 
            />
          )}
          
          {isStreaming && !streamingContent && (
            <div className="flex items-center gap-1.5 pl-2 py-2 opacity-50">
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};