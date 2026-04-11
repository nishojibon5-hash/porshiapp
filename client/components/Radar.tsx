import React from 'react';
import { Device } from '@/context/DeviceContext';

interface RadarProps {
  devices: Device[];
  onDeviceClick?: (device: Device) => void;
}

export const Radar: React.FC<RadarProps> = ({ devices, onDeviceClick }) => {
  const getAvatarPosition = (index: number, total: number) => {
    const angle = (index / total) * 360;
    const radius = 120;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  const getSignalColor = (signalStrength: number) => {
    // Signal strength is typically in dBm, ranging from -30 (good) to -90 (poor)
    if (signalStrength > -50) return 'text-green-400';
    if (signalStrength > -70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-80 h-80">
        {/* Radar background circles */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
          {/* Outer circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="hsl(var(--porshi-neon))"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* Middle circle */}
          <circle
            cx="150"
            cy="150"
            r="100"
            fill="none"
            stroke="hsl(var(--porshi-neon))"
            strokeWidth="1"
            opacity="0.3"
          />
          {/* Inner circle */}
          <circle
            cx="150"
            cy="150"
            r="60"
            fill="none"
            stroke="hsl(var(--porshi-neon))"
            strokeWidth="1"
            opacity="0.4"
          />
          {/* Cross lines */}
          <line x1="150" y1="10" x2="150" y2="290" stroke="hsl(var(--porshi-neon))" strokeWidth="1" opacity="0.2" />
          <line x1="10" y1="150" x2="290" y2="150" stroke="hsl(var(--porshi-neon))" strokeWidth="1" opacity="0.2" />
        </svg>

        {/* Center pulse animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Pulse rings */}
          <div
            className="absolute w-6 h-6 rounded-full border-2 animate-pulse-ring"
            style={{
              borderColor: 'hsl(var(--porshi-neon))',
              animationDelay: '0s',
            }}
          />
          <div
            className="absolute w-6 h-6 rounded-full border-2 animate-pulse-ring"
            style={{
              borderColor: 'hsl(var(--porshi-neon))',
              animationDelay: '0.6s',
            }}
          />
          <div
            className="absolute w-6 h-6 rounded-full border-2 animate-pulse-ring"
            style={{
              borderColor: 'hsl(var(--porshi-neon))',
              animationDelay: '1.2s',
            }}
          />

          {/* Center dot */}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: 'hsl(var(--porshi-neon))',
              boxShadow: '0 0 20px hsl(var(--porshi-neon))',
            }}
          />
        </div>

        {/* Discovered devices as floating avatars */}
        <div className="absolute inset-0">
          {devices.map((device, index) => {
            const position = getAvatarPosition(index, Math.max(devices.length, 1));
            return (
              <button
                key={device.id}
                onClick={() => onDeviceClick?.(device)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 focus:outline-none"
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  animation: 'float-avatar 3s ease-in-out infinite',
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                {/* Avatar background glow */}
                <div
                  className="absolute inset-0 rounded-full -z-10"
                  style={{
                    width: '60px',
                    height: '60px',
                    left: '-30px',
                    top: '-30px',
                    backgroundColor: 'hsl(var(--porshi-neon))',
                    opacity: 0.2,
                    filter: 'blur(8px)',
                  }}
                />

                {/* Avatar circle */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 cursor-pointer bg-porshi-dark-light"
                  style={{
                    borderColor: 'hsl(var(--porshi-neon))',
                  }}
                >
                  {device.avatar}
                </div>

                {/* Signal strength indicator */}
                <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold ${getSignalColor(device.signalStrength)} whitespace-nowrap`}>
                  {device.distance}m
                </div>

                {/* Device name tooltip (on hover) */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-porshi-dark-light px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none border border-porshi-neon/50 text-porshi-neon">
                  {device.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Devices count */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-porshi-neon font-semibold text-lg">
          {devices.length} {devices.length === 1 ? 'person' : 'people'} nearby
        </p>
      </div>
    </div>
  );
};
