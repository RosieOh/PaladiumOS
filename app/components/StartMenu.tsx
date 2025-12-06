'use client';

import React, { useCallback, useMemo } from 'react';
import { Search, User, LogOut } from 'lucide-react';
import { App, Settings } from '../types';
import { APPS } from '../constants';

interface StartMenuProps {
  apps: App[];
  onAppClick: (appId: string) => void;
  settings: Settings;
  onLogout: () => void;
}

export const StartMenu = React.memo(({ apps, onAppClick, settings, onLogout }: StartMenuProps) => {
  const handleAppClick = useCallback((appId: string) => {
    onAppClick(appId);
  }, [onAppClick]);

  const username = useMemo(() => settings.username || 'Admin', [settings.username]);

  return (
    <div 
      className="absolute bottom-14 left-4 w-[600px] h-[600px] bg-white/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/40 z-[9998] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200"
      onMouseDown={e => e.stopPropagation()}
      role="dialog"
      aria-label="Start menu"
      aria-modal="true"
    >
      <div className="p-8 flex-1">
        <div className="relative mb-6">
           <Search className="absolute left-3 top-2.5 text-gray-500" size={18} aria-hidden="true" />
           <input 
             type="text" 
             placeholder="Search for apps, settings, and documents" 
             className="w-full bg-gray-200/50 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent focus:bg-white transition-all" 
             autoFocus
             aria-label="Search apps and documents"
           />
        </div>
        <h3 className="text-xs font-bold text-gray-500 mb-4 ml-1">Pinned</h3>
        <div className="grid grid-cols-6 gap-y-6 gap-x-2" role="list">
           {APPS.map(app => (
             <button 
               key={app.id} 
               onClick={() => handleAppClick(app.id)} 
               className="flex flex-col items-center gap-2 group"
               role="listitem"
               aria-label={`Open ${app.name}`}
             >
               <div className="p-2 rounded-lg group-hover:bg-white/80 transition-colors shadow-sm bg-white/40">
                 {app.icon}
               </div>
               <span className="text-[11px] font-medium text-gray-700">{app.name}</span>
             </button>
           ))}
        </div>
      </div>
      <div className="bg-gray-100/80 p-4 flex justify-between items-center border-t border-gray-200/50 px-8">
         <div className="flex items-center gap-3 hover:bg-white/60 px-3 py-1.5 rounded-md cursor-pointer transition-colors" role="button" aria-label="User profile">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <User size={16} />
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-semibold text-gray-800">{username}</span>
               <span className="text-[10px] text-gray-500">Administrator</span>
            </div>
         </div>
         <button 
           onClick={onLogout} 
           className="p-2 hover:bg-red-100 hover:text-red-500 rounded-md transition-colors"
           aria-label="Log out"
         >
           <LogOut size={20} />
         </button>
      </div>
    </div>
  );
});

StartMenu.displayName = 'StartMenu';
