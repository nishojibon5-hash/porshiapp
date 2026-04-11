import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '@/context/DeviceContext';
import { ChatBubble } from '@/components/ChatBubble';

export default function ChatScreen() {
  const navigate = useNavigate();
  const { currentUser, connectedDevice, messages, addMessage, disconnectFromDevice } = useDevice();
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connectedDevice) {
      navigate('/radar');
      return;
    }
  }, [connectedDevice, navigate]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !connectedDevice || !currentUser) {
      return;
    }

    setIsLoading(true);

    // Create message
    const newMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: connectedDevice.id,
      text: messageText.trim(),
      timestamp: Date.now(),
      isOwn: true,
    };

    // Add sent message
    addMessage(newMessage);
    setMessageText('');

    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: connectedDevice.id,
        senderName: connectedDevice.name,
        recipientId: currentUser.id,
        text: `Thanks for the message! This is a simulated response from ${connectedDevice.name}.`,
        timestamp: Date.now(),
        isOwn: false,
      };
      addMessage(responseMessage);
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    disconnectFromDevice();
    navigate('/radar');
  };

  if (!connectedDevice || !currentUser) {
    return null;
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        backgroundColor: 'hsl(var(--porshi-dark))',
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b-2"
        style={{
          backgroundColor: 'hsl(var(--porshi-dark-light))',
          borderColor: 'hsl(var(--porshi-neon) / 0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={handleDisconnect}
              className="w-8 h-8 flex items-center justify-center opacity-70 hover:opacity-100"
              style={{ color: 'hsl(var(--porshi-neon))' }}
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg" style={{ color: 'hsl(var(--porshi-neon))' }}>
                {connectedDevice.name}
              </h1>
              <p className="text-xs opacity-60" style={{ color: 'hsl(var(--porshi-neon))' }}>
                Connected • {connectedDevice.distance}m away
              </p>
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-full text-2xl flex items-center justify-center border-2"
            style={{
              backgroundColor: 'hsl(var(--porshi-dark))',
              borderColor: 'hsl(var(--porshi-neon))',
            }}
          >
            {connectedDevice.avatar}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-4xl mb-4 opacity-40">{connectedDevice.avatar}</div>
            <p className="text-center opacity-60" style={{ color: 'hsl(var(--porshi-neon))' }}>
              Start a conversation with {connectedDevice.name}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div
                  className="rounded-3xl px-5 py-3"
                  style={{
                    backgroundColor: 'hsl(var(--porshi-received-bubble))',
                  }}
                >
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div
        className="p-4 border-t-2"
        style={{
          backgroundColor: 'hsl(var(--porshi-dark-light))',
          borderColor: 'hsl(var(--porshi-neon) / 0.2)',
        }}
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 px-4 py-3 rounded-2xl bg-opacity-20 border-2 focus:outline-none transition-all"
            style={{
              backgroundColor: 'hsl(var(--porshi-neon) / 0.05)',
              borderColor: 'hsl(var(--porshi-neon) / 0.3)',
              color: 'white',
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isLoading}
            className="px-6 py-3 rounded-2xl font-bold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: messageText.trim() ? 'hsl(var(--porshi-neon))' : 'hsl(var(--porshi-neon) / 0.3)',
              color: 'hsl(var(--porshi-dark))',
            }}
          >
            Send
          </button>
        </div>
        <p className="text-xs mt-2 opacity-50 text-right" style={{ color: 'hsl(var(--porshi-neon))' }}>
          {messageText.length}/500
        </p>
      </div>
    </div>
  );
}
