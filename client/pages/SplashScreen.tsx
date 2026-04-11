import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate to profile setup after 3 seconds
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: 'hsl(var(--porshi-dark))',
      }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--porshi-neon)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--porshi-neon)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Porshi Logo with pulse effect */}
        <div className="relative mb-12">
          {/* Outer pulse ring 1 */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{
              borderColor: 'hsl(var(--porshi-neon))',
              borderWidth: '3px',
              animationDelay: '0s',
              width: '200px',
              height: '200px',
              left: '-50px',
              top: '-50px',
            }}
          />
          {/* Outer pulse ring 2 */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{
              borderColor: 'hsl(var(--porshi-neon))',
              borderWidth: '2px',
              animationDelay: '0.66s',
              opacity: 0.7,
              width: '200px',
              height: '200px',
              left: '-50px',
              top: '-50px',
            }}
          />

          {/* Main logo container */}
          <div className="relative flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-20">
              {/* Globe with arrow */}
              <g transform="translate(60, 60)">
                {/* Globe */}
                <circle
                  cx="0"
                  cy="0"
                  r="35"
                  fill="none"
                  stroke="hsl(var(--porshi-neon))"
                  strokeWidth="3"
                />
                {/* Globe lines */}
                <circle cx="0" cy="0" r="28" fill="none" stroke="hsl(var(--porshi-neon))" strokeWidth="1.5" opacity="0.5" />
                <line x1="-35" y1="0" x2="35" y2="0" stroke="hsl(var(--porshi-neon))" strokeWidth="1.5" opacity="0.5" />
                <path d="M -25 -25 Q 0 -35 25 -25" fill="none" stroke="hsl(var(--porshi-neon))" strokeWidth="1.5" opacity="0.5" />

                {/* Arrow going up and right */}
                <g transform="translate(20, -15) rotate(45)">
                  <path
                    d="M 0 0 L 25 0 M 25 0 L 20 -5 M 25 0 L 20 5"
                    fill="none"
                    stroke="hsl(var(--porshi-neon))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </svg>

            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-40"
              style={{
                backgroundColor: 'hsl(var(--porshi-neon))',
                width: '120px',
                height: '120px',
                left: '-60px',
                top: '-60px',
                zIndex: 10,
              }}
            />
          </div>
        </div>

        {/* App name */}
        <h1 className="text-5xl font-bold mb-2 text-center" style={{ color: 'hsl(var(--porshi-neon))' }}>
          Porshi
        </h1>

        {/* Tagline */}
        <p className="text-lg mb-12 text-center opacity-75" style={{ color: 'hsl(var(--porshi-neon))' }}>
          Nearby P2P Chat
        </p>

        {/* Loading indicator */}
        <div className="flex gap-2 items-center">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: 'hsl(var(--porshi-neon))',
              animationDelay: '0s',
            }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: 'hsl(var(--porshi-neon))',
              animationDelay: '0.2s',
            }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: 'hsl(var(--porshi-neon))',
              animationDelay: '0.4s',
            }}
          />
        </div>

        {/* Subtitle text */}
        <p className="mt-8 text-sm opacity-60 text-center max-w-xs" style={{ color: 'hsl(var(--porshi-neon))' }}>
          Connecting nearby devices securely
        </p>
      </div>
    </div>
  );
}
