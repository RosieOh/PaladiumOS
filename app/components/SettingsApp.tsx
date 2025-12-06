'use client';

import React, { useCallback } from 'react';
import { Check, Clock, User } from 'lucide-react';
import { Settings } from '../types';
import { WALLPAPERS } from '../constants';

interface SettingsAppProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const SettingsApp = React.memo(({ settings, setSettings }: SettingsAppProps) => {
  const handleWallpaperChange = useCallback((wallpaperId: string) => {
    setSettings(prev => ({ ...prev, wallpaper: wallpaperId }));
  }, [setSettings]);

  const handleThemeToggle = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  }, [setSettings]);

  const handleTimeFormatToggle = useCallback(() => {
    setSettings(prev => ({ ...prev, time24h: !prev.time24h }));
  }, [setSettings]);

  return (
    <div className="p-8 max-w-3xl mx-auto h-full overflow-auto bg-gray-50">
      <h2 className="text-3xl font-light mb-8 text-gray-800">Settings</h2>
      
      <section className="mb-10" aria-labelledby="personalization-heading">
        <h3 id="personalization-heading" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Personalization</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <label className="block text-sm font-medium mb-4 text-gray-700">Background</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="radiogroup" aria-label="Wallpaper selection">
            {WALLPAPERS.map(wp => (
              <button
                key={wp.id}
                onClick={() => handleWallpaperChange(wp.id)}
                className={`group relative aspect-video rounded-lg overflow-hidden transition-all shadow-sm
                  ${settings.wallpaper === wp.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-105'}
                `}
                role="radio"
                aria-checked={settings.wallpaper === wp.id}
                aria-label={wp.name}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${wp.color}`} />
                <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">{wp.name}</span>
                {settings.wallpaper === wp.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="bg-white rounded-full p-1 shadow-lg">
                      <Check size={12} className="text-blue-600" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section aria-labelledby="system-heading">
        <h3 id="system-heading" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">System</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                 <Clock size={16} />
               </div>
               <span className="text-sm font-medium text-gray-700">24-Hour Time</span>
            </div>
             <button 
              onClick={handleTimeFormatToggle}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.time24h ? 'bg-blue-600' : 'bg-gray-200'}`}
              aria-label={`${settings.time24h ? 'Disable' : 'Enable'} 24-hour time format`}
              role="switch"
              aria-checked={settings.time24h}
            >
              <span className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${settings.time24h ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                 <User size={16} />
               </div>
               <span className="text-sm font-medium text-gray-700">User Profile</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{settings.username || 'Admin'}</span>
          </div>
        </div>
      </section>
    </div>
  );
});

SettingsApp.displayName = 'SettingsApp';
