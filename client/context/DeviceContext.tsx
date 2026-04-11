import React, { createContext, useContext, useState, useCallback } from 'react';

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
}

interface DeviceContextType {
  // User Profile
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  
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
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  // Connection Requests
  incomingRequests: Array<{ device: Device; timestamp: number }>;
  acceptRequest: (deviceId: string) => void;
  declineRequest: (deviceId: string) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Array<{ device: Device; timestamp: number }>>([]);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    
    // Simulate device discovery - In real implementation, this would use react-native-nearby-connectivity
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

    // Simulate gradual device discovery
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

  const addMessage = useCallback((message: Message) => {
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
        clearMessages,
        incomingRequests,
        acceptRequest,
        declineRequest,
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
