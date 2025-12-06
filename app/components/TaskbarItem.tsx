'use client';

import React from 'react';
import { App } from '../types';

interface TaskbarItemProps {
  app: App;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

export const TaskbarItem = React.memo(({ app, isOpen, isActive, onClick }: TaskbarItemProps) => (
  <button 
    onClick={onClick}
    className={`
      h-10 w-10 flex items-center justify-center rounded-md transition-all relative group
      ${isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}
    `}
    aria-label={`${app.name} ${isOpen ? 'window' : 'app'}`}
    aria-pressed={isActive}
  >
    <div className={`transition-transform duration-200 ${isActive ? 'scale-90' : 'group-hover:-translate-y-1'}`}>
      {app.icon}
    </div>
    {isOpen && (
      <div 
        className={`absolute bottom-1 w-1 h-1 rounded-full ${isActive ? 'bg-blue-400 w-3' : 'bg-gray-400'} transition-all duration-300`}
        aria-hidden="true"
      />
    )}
  </button>
));

TaskbarItem.displayName = 'TaskbarItem';
