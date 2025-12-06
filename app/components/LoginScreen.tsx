'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, User } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  user: { name: string };
}

export const LoginScreen = React.memo(({ onLogin, user }: LoginScreenProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  }, [onLogin]);

  return (
    <div 
      className="absolute inset-0 z-[99999] bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1600&q=80)' }}
      role="dialog"
      aria-label="Login screen"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="z-10 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white/30 shadow-2xl" aria-hidden="true">
           <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
             <User size={64} />
           </div>
        </div>
        <h2 className="text-3xl font-light">{user.name}</h2>
        {loading ? (
          <div className="flex flex-col items-center gap-2" aria-live="polite" aria-label="Logging in">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Welcome...</span>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-3 w-64">
            <input 
              type="password" 
              placeholder="Password (any)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white/20 border border-white/30 rounded px-3 py-2 placeholder-white/70 focus:outline-none focus:bg-white/30 transition-colors text-center"
              autoFocus
              aria-label="Password"
              aria-required="false"
            />
            <button 
              type="submit" 
              className="bg-white/20 hover:bg-white/30 py-2 rounded backdrop-blur font-medium transition-all flex items-center justify-center gap-2"
              aria-label="Sign in"
            >
              Sign In <ArrowLeft size={16} className="rotate-180" aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

LoginScreen.displayName = 'LoginScreen';
