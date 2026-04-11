import React from 'react';
import { Message } from '@/context/DeviceContext';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (message.isOwn) {
    // Sent message (Neon Green)
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xs lg:max-w-md">
          <div
            className="rounded-3xl px-5 py-3 shadow-lg"
            style={{
              backgroundColor: 'hsl(var(--porshi-sent-bubble))',
            }}
          >
            <p className="text-white text-sm lg:text-base break-words">{message.text}</p>
          </div>
          <p className="text-xs mt-1 text-right opacity-70 pr-2">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  // Received message (Grey)
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md">
        <div
          className="rounded-3xl px-5 py-3 shadow-lg"
          style={{
            backgroundColor: 'hsl(var(--porshi-received-bubble))',
          }}
        >
          <p className="text-white text-sm lg:text-base break-words">{message.text}</p>
        </div>
        <p className="text-xs mt-1 text-left opacity-70 pl-2">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
};
