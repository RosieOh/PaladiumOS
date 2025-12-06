'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { Window } from '../types';

interface WindowFrameProps {
  window: Window;
  active: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onPositionUpdate?: (x: number, y: number) => void;
  onSizeUpdate?: (w: number, h: number) => void;
  children: React.ReactNode;
}

export const WindowFrame = React.memo(({ 
  window, 
  active, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus,
  onPositionUpdate,
  onSizeUpdate,
  children 
}: WindowFrameProps) => {
  const [position, setPosition] = useState({ x: window.x, y: window.y });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ w: window.w, h: window.h });
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  // Sync position and size from props
  useEffect(() => {
    if (!isDragging && !window.isMaximized) {
      setPosition({ x: window.x, y: window.y });
    }
    if (window.isMaximized) {
      setPosition({ x: 0, y: 0 });
    }
    setSize({ w: window.w, h: window.h });
  }, [window.isMaximized, window.x, window.y, window.w, window.h, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (window.isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  }, [window.isMaximized, position, onFocus]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.isMaximized) return;
    onFocus();
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.w,
      h: size.h
    };
  }, [window.isMaximized, size, onFocus]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        
        // Window snapping
        const snapThreshold = 20;
        const screenWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
        const screenHeight = (typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080) - 48; // Taskbar height
        
        // Snap to left edge
        if (Math.abs(newX) < snapThreshold) {
          newX = 0;
        }
        // Snap to right edge
        else if (Math.abs(newX + size.w - screenWidth) < snapThreshold) {
          newX = screenWidth - size.w;
        }
        // Snap to top edge
        if (Math.abs(newY) < snapThreshold) {
          newY = 0;
        }
        // Snap to bottom edge
        else if (Math.abs(newY + size.h - screenHeight) < snapThreshold) {
          newY = screenHeight - size.h;
        }
        
        setPosition({ x: newX, y: newY });
        if (onPositionUpdate) {
          onPositionUpdate(newX, newY);
        }
      } else if (isResizing && !window.isMaximized) {
        const newW = Math.max(300, resizeStart.current.w + (e.clientX - resizeStart.current.x));
        const newH = Math.max(200, resizeStart.current.h + (e.clientY - resizeStart.current.y));
        setSize({ w: newW, h: newH });
        if (onSizeUpdate) {
          onSizeUpdate(newW, newH);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, window.isMaximized, onPositionUpdate, onSizeUpdate]);

  if (window.isMinimized) return null;

  const currentWidth = window.isMaximized ? '100%' : size.w;
  const currentHeight = window.isMaximized ? '100%' : size.h;

  return (
    <div
      ref={frameRef}
      className={`absolute flex flex-col bg-white/95 backdrop-blur-xl shadow-2xl rounded-lg overflow-hidden border border-gray-200/50 transition-all duration-200
        ${window.isMaximized ? 'w-full h-[calc(100vh-48px)] top-0 left-0 rounded-none' : 'rounded-lg'}
        ${active ? 'z-50 ring-1 ring-blue-500/30 shadow-blue-500/20' : 'z-10 opacity-90 grayscale-[0.2]'}
      `}
      style={{
        width: currentWidth,
        height: currentHeight,
        transform: window.isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        zIndex: window.zIndex
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div 
        className="h-9 bg-gray-100/80 flex items-center justify-between px-3 select-none cursor-default border-b border-gray-200/50"
        onDoubleClick={onMaximize}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
          {window.icon}
          <span>{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }} 
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label={window.isMaximized ? "Restore" : "Maximize"}
          >
            {window.isMaximized ? <Square size={12} /> : <Maximize2 size={12} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="p-1.5 hover:bg-red-500 hover:text-white rounded transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-white/50 relative flex flex-col">
        {children}
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent hover:bg-blue-500/20 transition-colors"
          onMouseDown={handleResizeStart}
          style={{ cursor: 'nwse-resize' }}
          aria-label="Resize window"
        />
      )}
    </div>
  );
});

WindowFrame.displayName = 'WindowFrame';
