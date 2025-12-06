import { useState, useCallback } from 'react';
import { Window, WindowData } from '../types';
import { APPS } from '../constants';
import { generateId } from '../utils';

export const useWindowManager = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(100);

  const openApp = useCallback((appId: string, data: WindowData | null = null) => {
    const appInfo = APPS.find(a => a.id === appId);
    if (!appInfo) return;

    // Single instance check for Settings
    const existing = windows.find(w => w.appId === appId && appId === 'settings');
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    const newWindow: Window = {
      id: generateId(),
      appId,
      title: data?.name || appInfo.name,
      icon: appInfo.icon,
      x: 100 + (windows.length * 30),
      y: 80 + (windows.length * 30),
      w: appId === 'notepad' ? 600 : appId === 'photos' ? 700 : 800,
      h: 500,
      zIndex: zIndexCounter + 1,
      isMinimized: false,
      isMaximized: false,
      data: data || undefined
    };

    setZIndexCounter(prev => prev + 1);
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    
    return newWindow.id;
  }, [windows, zIndexCounter]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindowId(prev => prev === id ? null : prev);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setZIndexCounter(prev => {
      const newZIndex = prev + 1;
      setWindows(prevWindows => 
        prevWindows.map(w => w.id === id ? { ...w, zIndex: newZIndex } : w)
      );
      return newZIndex;
    });
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, x, y } : w
    ));
  }, []);

  const updateWindowSize = useCallback((id: string, w: number, h: number) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, w, h } : window
    ));
  }, []);

  const minimizeAll = useCallback(() => {
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
  }, []);

  return {
    windows,
    activeWindowId,
    openApp,
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    updateWindowPosition,
    updateWindowSize,
    minimizeAll
  };
};

