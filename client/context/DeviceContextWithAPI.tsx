/**
 * Enhanced DeviceContext with Vercel API Integration
 * Use this version when integrating with Vercel backend
 * 
 * SETUP:
 * 1. Deploy Vercel backend
 * 2. Set VITE_API_URL environment variable
 * 3. Replace imports in App.tsx from DeviceContext to DeviceContextWithAPI
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface User {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface Device {
  id: string;
  name: string;
  avatar: string;
  signalStrength: number;
  distance?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  timestamp: number;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

interface DeviceContextType {
  // User Profile
  currentUser: User | null;
  setCurrentUser: (user: User) => Promise<void>;
  
  // Device Discovery
  discoveredDevices: Device[];
  isScanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  
  // Connection
  connectedDevice: Device | null;
  connectToDevice: (device: Device) => void;
  disconnectFromDevice: () => void;
  
  // Messages
  messages: Message[];
  addMessage: (message: Message) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  loadChatHistory: (recipientId: string) => Promise<void>;
  clearMessages: () => void;
  
  // Connection Requests
  incomingRequests: Array<{ device: Device; timestamp: number }>;
  acceptRequest: (deviceId: string) => void;
  declineRequest: (deviceId: string) => void;

  // API Status
  isLoading: boolean;
  error: string | null;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Array<{ device: Device; timestamp: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register user on Vercel backend
  const setCurrentUser = useCallback(async (user: User) => {
    try {
      setIsLoading(true);
      setError(null);

      // Send user profile to Vercel
      const response = await fetch(`${API_URL}/sync-chat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          bio: user.bio,
          avatar: user.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      const data = await response.json();
      setCurrentUserState(user);
      console.log('User registered:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('User registration error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    
    // Simulate device discovery
    const simulatedDevices: Device[] = [
      {
        id: 'device-1',
        name: 'Alex',
        avatar: '👨‍💻',
        signalStrength: -45,
        distance: 5,
      },
      {
        id: 'device-2',
        name: 'Sara',
        avatar: '👩‍🎨',
        signalStrength: -55,
        distance: 8,
      },
      {
        id: 'device-3',
        name: 'John',
        avatar: '👨‍🏫',
        signalStrength: -65,
        distance: 12,
      },
    ];

    let deviceCount = 0;
    const interval = setInterval(() => {
      if (deviceCount < simulatedDevices.length) {
        setDiscoveredDevices((prev) => [...prev, simulatedDevices[deviceCount]]);
        deviceCount++;
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const connectToDevice = useCallback((device: Device) => {
    setConnectedDevice(device);
  }, []);

  const disconnectFromDevice = useCallback(() => {
    setConnectedDevice(null);
    setMessages([]);
  }, []);

  // Load chat history from Vercel
  const loadChatHistory = useCallback(
    async (recipientId: string) => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/sync-chat?userId=${currentUser.id}&recipientId=${recipientId}&limit=50`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load chat history');
        }

        const data = await response.json();
        const loadedMessages = data.messages.map((msg: any) => ({
          ...msg,
          isOwn: msg.senderId === currentUser.id,
        }));

        setMessages(loadedMessages);
        console.log('Chat history loaded:', loadedMessages.length, 'messages');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Load history error:', message);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Send message via Vercel API
  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentUser || !connectedDevice || !text.trim()) {
        return;
      }

      try {
        setError(null);

        // Add optimistic message
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          recipientId: connectedDevice.id,
          text: text.trim(),
          timestamp: Date.now(),
          isOwn: true,
          status: 'sending',
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Send to Vercel
        const response = await fetch(`${API_URL}/sync-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderId: currentUser.id,
            senderName: currentUser.name,
            recipientId: connectedDevice.id,
            text: text.trim(),
            timestamp: Date.now(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Update message with server response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? {
                  ...msg,
                  id: data.messageId,
                  status: 'delivered',
                }
              : msg
          )
        );

        console.log('Message sent:', data.messageId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Send message error:', message);

        // Mark message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUser.id && msg.timestamp === Date.now()
              ? { ...msg, status: 'failed' }
              : msg
          )
        );
      }
    },
    [currentUser, connectedDevice]
  );

  const addMessage = useCallback(async (message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const acceptRequest = useCallback((deviceId: string) => {
    const request = incomingRequests.find((r) => r.device.id === deviceId);
    if (request) {
      connectToDevice(request.device);
      setIncomingRequests((prev) => prev.filter((r) => r.device.id !== deviceId));
    }
  }, [incomingRequests, connectToDevice]);

  const declineRequest = useCallback((deviceId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.device.id !== deviceId));
  }, []);

  // Load chat history when device connects
  useEffect(() => {
    if (connectedDevice && currentUser) {
      loadChatHistory(connectedDevice.id);
    }
  }, [connectedDevice, currentUser, loadChatHistory]);

  return (
    <DeviceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        discoveredDevices,
        isScanning,
        startScanning,
        stopScanning,
        connectedDevice,
        connectToDevice,
        disconnectFromDevice,
        messages,
        addMessage,
        sendMessage,
        loadChatHistory,
        clearMessages,
        incomingRequests,
        acceptRequest,
        declineRequest,
        isLoading,
        error,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
