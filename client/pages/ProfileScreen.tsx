import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '@/context/DeviceContext';

const AVATAR_OPTIONS = ['👨‍💻', '👩‍🎨', '👨‍🏫', '👩‍⚕️', '👨‍🍳', '👩‍🚀', '👨‍🎭', '👩‍💼', '🧑‍🎸', '👨‍⚖️'];

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { setCurrentUser } = useDevice();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar,
    };

    setCurrentUser(newUser);
    navigate('/radar');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'hsl(var(--porshi-dark))',
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--porshi-neon))' }}>
            Set Your Profile
          </h1>
          <p className="opacity-70" style={{ color: 'hsl(var(--porshi-neon))' }}>
            Create your Porshi identity
          </p>
        </div>

        {/* Avatar Picker */}
        <div className="mb-8">
          <p className="text-sm font-semibold mb-3 opacity-80" style={{ color: 'hsl(var(--porshi-neon))' }}>
            Choose Your Avatar
          </p>
          <div className="grid grid-cols-5 gap-3">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center border-2 transition-all ${
                  selectedAvatar === avatar ? 'scale-110 border-2' : 'border-opacity-30'
                }`}
                style={{
                  backgroundColor:
                    selectedAvatar === avatar
                      ? 'hsl(var(--porshi-neon) / 0.2)'
                      : 'hsl(var(--porshi-dark-light))',
                  borderColor: selectedAvatar === avatar ? 'hsl(var(--porshi-neon))' : 'hsl(var(--porshi-neon) / 0.3)',
                }}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Avatar Display */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-full text-5xl flex items-center justify-center border-3"
            style={{
              backgroundColor: 'hsl(var(--porshi-dark-light))',
              borderColor: 'hsl(var(--porshi-neon))',
              boxShadow: '0 0 20px hsl(var(--porshi-neon) / 0.3)',
            }}
          >
            {selectedAvatar}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="text-sm font-semibold block mb-2 opacity-80" style={{ color: 'hsl(var(--porshi-neon))' }}>
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg bg-opacity-10 border-2 focus:outline-none transition-all"
            style={{
              backgroundColor: 'hsl(var(--porshi-neon) / 0.05)',
              borderColor: error ? '#ef4444' : 'hsl(var(--porshi-neon) / 0.3)',
              color: 'white',
            }}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Bio Input */}
        <div className="mb-8">
          <label className="text-sm font-semibold block mb-2 opacity-80" style={{ color: 'hsl(var(--porshi-neon))' }}>
            Bio (Optional)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about yourself..."
            maxLength={100}
            className="w-full px-4 py-3 rounded-lg bg-opacity-10 border-2 focus:outline-none transition-all resize-none"
            rows={3}
            style={{
              backgroundColor: 'hsl(var(--porshi-neon) / 0.05)',
              borderColor: 'hsl(var(--porshi-neon) / 0.3)',
              color: 'white',
            }}
          />
          <p className="text-xs mt-1 opacity-50" style={{ color: 'hsl(var(--porshi-neon))' }}>
            {bio.length}/100
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg font-bold text-lg mb-4 transition-all hover:shadow-lg"
          style={{
            backgroundColor: 'hsl(var(--porshi-neon))',
            color: 'hsl(var(--porshi-dark))',
          }}
        >
          Start Scanning
        </button>

        {/* Info text */}
        <p className="text-xs text-center opacity-60" style={{ color: 'hsl(var(--porshi-neon))' }}>
          You can update your profile anytime
        </p>
      </div>
    </div>
  );
}
