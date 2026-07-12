import React from 'react';
import { type Message } from '../../stores/session-store';
import { clsx } from 'clsx';

interface MessageBubbleProps {
  message: Message;
}

// React.memo prevents the entire canvas from re-rendering when new tokens stream in
export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={clsx("flex w-full mb-4 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("max-w-[80%] p-4 rounded-xl relative transition-all duration-200 font-sans text-[13px] leading-relaxed",
        isUser 
          ? "bg-brand-blue/10 border border-brand-blue/20 text-blue-100 shadow-[0_0_12px_rgba(79,172,254,0.05)]" 
          : "glass-panel border-white/[0.04] text-slate-200"
      )}>
        {/* Identity dot marker instead of heavy profile images */}
        <div className={clsx("absolute top-3.5 w-1.5 h-1.5 rounded-full", 
          isUser ? "-left-3 bg-brand-blue" : "-right-3 bg-brand-cyan"
        )} />
        <p className="whitespace-pre-wrap selection:bg-brand-cyan/20">{message.content}</p>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';