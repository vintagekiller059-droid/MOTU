// frontend/src/components/chat/MessageStream.tsx
import React from 'react';
import { useSessionStore } from '../../stores/session-store';

interface MessageStreamProps {
  messageId: string;
}

export const MessageStream: React.FC<MessageStreamProps> = ({ messageId }) => {
  const message = useSessionStore((state) =>
    state.messages.find((m) => m.id === messageId)
  );

  if (!message) {
    return <div className="message-stream loading">...</div>;
  }

  console.log('[MOTU] ✓ UI rendered, content length:', message.content.length);

  return (
    <div className="message-stream">
      <span className="message-content">{message.content}</span>
      {message.isStreaming && (
        <span className="cursor-blink">▌</span>
      )}
    </div>
  );
};