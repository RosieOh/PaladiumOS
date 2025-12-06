'use client';

import React, { useCallback, useMemo } from 'react';
import { Grid, Clock } from 'lucide-react';
import { App, Window, Settings } from '../types';
import { TaskbarItem } from './TaskbarItem';
import { formatDate } from '../utils';

interface TaskbarProps {
  startMenuOpen: boolean;
  onStartMenuToggle: () => void;
  apps: App[];
  windows: Window[];
  activeWindowId: string | null;
  onAppClick: (appId: string, data?: any) => void;
  onWindowFocus: (id: string) => void;
  onWindowMinimize: (id: string) => void;
  time: Date;
  settings: Settings;
  onSettingsClick: () => void;
  onMinimizeAll: () => void;
}

export const Taskbar = React.memo(({
  startMenuOpen,
  onStartMenuToggle,
  apps,
  windows,
  activeWindowId,
  onAppClick,
  onWindowFocus,
  onWindowMinimize,
  time,
  settings,
  onSettingsClick,
  onMinimizeAll
}: TaskbarProps) => {
  const formattedTime = useMemo(() => formatDate(time, !settings.time24h), [time, settings.time24h]);
  const formattedDate = useMemo(() => time.toLocaleDateString(), [time]);

  const handleTaskbarItemClick = useCallback((app: App) => {
    const instance = windows.find(w => w.appId === app.id);
    const isOpen = !!instance;
    const isActive = activeWindowId === instance?.id;

    if (isOpen && instance) {
      if (isActive && !instance.isMinimized) {
        onWindowMinimize(instance.id);
      } else {
        onWindowFocus(instance.id);
        if (instance.isMinimized) onWindowMinimize(instance.id);
      }
    } else {
      onAppClick(app.id);
    }
  }, [windows, activeWindowId, onAppClick, onWindowFocus, onWindowMinimize]);

  return (
    <div 
      className="absolute bottom-0 w-full h-12 bg-white/90 backdrop-blur-2xl border-t border-white/50 flex justify-between items-center px-3 z-[10000] shadow-lg"
      onMouseDown={e => e.stopPropagation()}
      role="toolbar"
      aria-label="Taskbar"
    >
      <div className="flex items-center gap-1">
         <button 
           onClick={onStartMenuToggle}
           className="p-2 hover:bg-white/50 rounded transition-all active:scale-95"
           aria-label={startMenuOpen ? "Close start menu" : "Open start menu"}
           aria-pressed={startMenuOpen}
         >
           <Grid className="text-blue-600 fill-blue-600 drop-shadow-sm" size={22} />
         </button>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 h-full" role="group" aria-label="Running applications">
         {apps.map(app => {
           const instance = windows.find(w => w.appId === app.id);
           const isOpen = !!instance;
           const isActive = activeWindowId === instance?.id;
           return (
             <TaskbarItem 
               key={app.id} 
               app={app} 
               isOpen={isOpen} 
               isActive={isActive}
               onClick={() => handleTaskbarItemClick(app)}
             />
           );
         })}
      </div>
      <div 
        className="flex items-center gap-3 px-3 py-1 hover:bg-white/50 rounded-md transition-colors cursor-default group"
        onClick={onMinimizeAll}
        role="button"
        aria-label={`Current time: ${formattedTime}, Date: ${formattedDate}. Click to minimize all windows.`}
      >
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium text-gray-800">{formattedTime}</span>
          <span className="text-[10px] text-gray-500">{formattedDate}</span>
        </div>
        <Clock size={18} className="text-gray-600 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
      </div>
    </div>
  );
});

Taskbar.displayName = 'Taskbar';
