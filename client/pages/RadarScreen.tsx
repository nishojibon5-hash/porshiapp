import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice, Device } from '@/context/DeviceContext';
import { Radar } from '@/components/Radar';

export default function RadarScreen() {
  const navigate = useNavigate();
  const { currentUser, discoveredDevices, isScanning, startScanning, stopScanning, connectToDevice } = useDevice();
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/profile');
      return;
    }

    if (!isScanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [currentUser, isScanning, startScanning, stopScanning, navigate]);

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setShowConnectionRequest(true);
  };

  const handleAccept = () => {
    if (selectedDevice) {
      connectToDevice(selectedDevice);
      setShowConnectionRequest(false);
      navigate('/chat');
    }
  };

  const handleDecline = () => {
    setShowConnectionRequest(false);
    setSelectedDevice(null);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundColor: 'hsl(var(--porshi-dark))',
      }}
    >
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--porshi-neon))' }}>
            Porshi Radar
          </h1>
          <p className="text-xs opacity-60" style={{ color: 'hsl(var(--porshi-neon))' }}>
            {currentUser?.name}
          </p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all hover:scale-110"
          style={{
            backgroundColor: 'hsl(var(--porshi-dark-light))',
            borderColor: 'hsl(var(--porshi-neon))',
          }}
        >
          {currentUser?.avatar}
        </button>
      </div>

      {/* Radar Component */}
      <div className="flex-1 flex items-center justify-center">
        <Radar devices={discoveredDevices} onDeviceClick={handleDeviceClick} />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-6 right-6 flex gap-4">
        <button
          onClick={() => {
            stopScanning();
            setTimeout(() => startScanning(), 500);
          }}
          className="flex-1 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
          style={{
            backgroundColor: 'hsl(var(--porshi-neon) / 0.2)',
            color: 'hsl(var(--porshi-neon))',
            border: '2px solid hsl(var(--porshi-neon) / 0.5)',
          }}
        >
          Rescan
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 rounded-lg font-semibold transition-all hover:shadow-lg opacity-70 hover:opacity-100"
          style={{
            backgroundColor: 'hsl(var(--porshi-neon) / 0.1)',
            color: 'hsl(var(--porshi-neon))',
            border: '2px solid hsl(var(--porshi-neon) / 0.3)',
          }}
        >
          Exit
        </button>
      </div>

      {/* Connection Request Modal */}
      {showConnectionRequest && selectedDevice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div
            className="w-full max-w-sm rounded-3xl p-8 border-2 backdrop-blur-sm"
            style={{
              backgroundColor: 'hsl(var(--porshi-dark-light) / 0.95)',
              borderColor: 'hsl(var(--porshi-neon) / 0.5)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-xs opacity-60 mb-3" style={{ color: 'hsl(var(--porshi-neon))' }}>
                CONNECTION REQUEST
              </p>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div
                className="w-24 h-24 rounded-full text-6xl flex items-center justify-center border-3"
                style={{
                  backgroundColor: 'hsl(var(--porshi-dark))',
                  borderColor: 'hsl(var(--porshi-neon))',
                  boxShadow: '0 0 30px hsl(var(--porshi-neon) / 0.3)',
                }}
              >
                {selectedDevice.avatar}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--porshi-neon))' }}>
                {selectedDevice.name}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm opacity-70">
                <span style={{ color: 'hsl(var(--porshi-neon))' }}>📍 {selectedDevice.distance}m away</span>
                <span className="opacity-50">•</span>
                <span style={{ color: 'hsl(var(--porshi-neon))' }}>📶 Signal: {selectedDevice.signalStrength} dBm</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 py-3 rounded-xl font-semibold transition-all border-2"
                style={{
                  backgroundColor: 'transparent',
                  color: 'hsl(var(--porshi-neon))',
                  borderColor: 'hsl(var(--porshi-neon) / 0.3)',
                }}
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
                style={{
                  backgroundColor: 'hsl(var(--porshi-neon))',
                  color: 'hsl(var(--porshi-dark))',
                }}
              >
                Accept
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center opacity-50 hover:opacity-100"
              style={{ color: 'hsl(var(--porshi-neon))' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
