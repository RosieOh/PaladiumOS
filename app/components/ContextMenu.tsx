'use client';

import React, { useEffect } from 'react';
import { ContextMenuState } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuState['options'];
  onClose: () => void;
}

export const ContextMenu = React.memo(({ x, y, options, onClose }: ContextMenuProps) => {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed bg-white/90 backdrop-blur-xl border border-white/20 rounded-md shadow-2xl py-1 w-48 z-[9999] animate-in fade-in zoom-in-95 duration-75"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label="Context menu"
    >
      {options.map((opt, i) => (
        <React.Fragment key={i}>
          {opt.divider ? (
            <div className="h-px bg-gray-200 my-1" role="separator" />
          ) : (
            <button 
              onClick={() => { opt.action?.(); onClose(); }}
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
              role="menuitem"
              aria-label={opt.label}
            >
              {opt.icon && <span className="w-4" aria-hidden="true">{opt.icon}</span>}
              {opt.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu';
