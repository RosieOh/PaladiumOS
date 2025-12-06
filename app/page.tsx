'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Folder, Settings, FileText, RefreshCw, Trash2, Maximize2, Copy, Scissors } from 'lucide-react';
import { File, Settings as SettingsType, ContextMenuState, SelectionBox } from './types';
import { APPS, WALLPAPERS } from './constants';
import { getLocalStorage, setLocalStorage, generateId } from './utils';
import { useWindowManager } from './hooks/useWindowManager';
import { useFileSystem } from './hooks/useFileSystem';
import { useClipboard } from './hooks/useClipboard';
import { LoginScreen } from './components/LoginScreen';
import { WindowFrame } from './components/WindowFrame';
import { Explorer } from './components/Explorer';
import { SettingsApp } from './components/SettingsApp';
import { Notepad } from './components/Notepad';
import { Browser } from './components/Browser';
import { PhotoViewer } from './components/PhotoViewer';
import { Calculator } from './components/Calculator';
import { Paint } from './components/Paint';
import { Terminal } from './components/Terminal';
import { DesktopIcon } from './components/DesktopIcon';
import { ContextMenu } from './components/ContextMenu';
import { StartMenu } from './components/StartMenu';
import { Taskbar } from './components/Taskbar';
import { NotificationSystem, Notification } from './components/NotificationSystem';
import { FileProperties } from './components/FileProperties';

export default function App() {
  // --- State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [altTabOpen, setAltTabOpen] = useState(false);
  const [propertiesFile, setPropertiesFile] = useState<File | null>(null);
  
  // Custom Hooks
  const windowManager = useWindowManager();
  const fileSystem = useFileSystem();
  const clipboard = useClipboard();

  // Persisted State
  const [settings, setSettings] = useState<SettingsType>(() => 
    getLocalStorage('os_settings_v2', { wallpaper: 'nature', theme: 'light', time24h: false, username: 'Admin' })
  );

  useEffect(() => {
    setLocalStorage('os_settings_v2', settings);
  }, [settings]);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Notification helpers
  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // --- Core Actions ---
  const handleOpenFile = useCallback((file: File) => {
    const fileData = fileSystem.openFile(file);
    if (fileData) {
      const appId = file.type === 'folder' ? 'explorer' : 
                   file.type === 'image' ? 'photos' : 
                   file.type === 'web' ? 'edge' : 'notepad';
      windowManager.openApp(appId, fileData);
      setStartMenuOpen(false);
    }
  }, [fileSystem, windowManager]);

  const handleOpenApp = useCallback((appId: string) => {
    windowManager.openApp(appId);
    setStartMenuOpen(false);
  }, [windowManager]);

  // Clipboard handlers
  const handleCopy = useCallback((files: File[]) => {
    clipboard.copy(files);
    showNotification({
      title: 'Copied',
      message: `${files.length} item${files.length > 1 ? 's' : ''} copied`,
      type: 'success',
      duration: 2000
    });
  }, [clipboard, showNotification]);

  const handleCut = useCallback((files: File[]) => {
    clipboard.cut(files);
    showNotification({
      title: 'Cut',
      message: `${files.length} item${files.length > 1 ? 's' : ''} cut`,
      type: 'info',
      duration: 2000
    });
  }, [clipboard, showNotification]);

  const handlePaste = useCallback((targetParentId: string) => {
    if (clipboard.hasClipboard && clipboard.clipboard) {
      clipboard.paste(targetParentId, (files, targetId, isCut) => {
        files.forEach(file => {
          const newFile: File = {
            ...file,
            id: generateId(),
            parentId: targetId
          };
          fileSystem.setFiles(prev => [...prev, newFile]);
        });
        if (isCut) {
          files.forEach(file => {
            fileSystem.deleteFile(file.id);
          });
        }
      });
      showNotification({
        title: 'Pasted',
        message: `${clipboard.clipboard!.files.length} item${clipboard.clipboard!.files.length > 1 ? 's' : ''} pasted`,
        type: 'success',
        duration: 2000
      });
    }
  }, [clipboard, fileSystem, showNotification]);

  // --- Interaction Handlers ---
  const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string | null = null) => {
    e.preventDefault();
    const isDesktop = !fileId;
    
    const options: ContextMenuState['options'] = [
      { label: 'Refresh', icon: <RefreshCw size={14}/>, action: () => window.location.reload() },
      { divider: true },
    ];

    if (isDesktop) {
      options.push(
        { label: 'New Folder', icon: <Folder size={14}/>, action: () => fileSystem.createNewFile('folder', 'desktop') },
        { label: 'New Text File', icon: <FileText size={14}/>, action: () => fileSystem.createNewFile('file', 'desktop') },
        { divider: true }
      );
      if (clipboard.hasClipboard) {
        options.push(
          { label: 'Paste', icon: <Copy size={14}/>, action: () => handlePaste('desktop') },
          { divider: true }
        );
      }
      options.push(
        { label: 'Personalize', icon: <Settings size={14}/>, action: () => handleOpenApp('settings') }
      );
    } else {
      const file = fileSystem.files.find(f => f.id === fileId);
      options.push(
        { label: 'Open', icon: <Maximize2 size={14}/>, action: () => file && handleOpenFile(file) },
        { label: 'Copy', icon: <Copy size={14}/>, action: () => file && handleCopy([file]) },
        { label: 'Cut', icon: <Scissors size={14}/>, action: () => file && handleCut([file]) }
      );
      if (clipboard.hasClipboard) {
        options.push(
          { label: 'Paste', icon: <Copy size={14}/>, action: () => handlePaste(file?.parentId || 'desktop') }
        );
      }
      options.push(
        { label: 'Delete', icon: <Trash2 size={14}/>, action: () => fileId && fileSystem.deleteFile(fileId) },
        { divider: true },
        { label: 'Properties', icon: <Settings size={14}/>, action: () => {
          if (file) {
            setPropertiesFile(file);
          }
        }}
      );
    }

    setContextMenu({ x: e.clientX, y: e.clientY, options });
  }, [fileSystem, handleOpenFile, handleOpenApp, clipboard, handleCopy, handleCut, handlePaste]);

  // Selection Box Logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectionBox({ startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, visible: true });
      setStartMenuOpen(false);
      setContextMenu(null);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (selectionBox?.visible) {
      setSelectionBox(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  }, [selectionBox]);

  // Memoized values
  const desktopItems = useMemo(() => 
    fileSystem.files.filter(f => f.parentId === 'desktop'),
    [fileSystem.files]
  );

  const handleMouseUp = useCallback(() => {
    if (selectionBox?.visible) {
      setSelectionBox(null);
    }
  }, [selectionBox]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Tab
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        setAltTabOpen(true);
      }
      
      // Win+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        windowManager.minimizeAll();
      }
      
      // Win+E
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleOpenApp('explorer');
      }
      
      // Win+R
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        // Run dialog - could implement later
        showNotification({
          title: 'Run',
          message: 'Run dialog (coming soon)',
          type: 'info',
          duration: 2000
        });
      }
      
      // Alt+F4
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (windowManager.activeWindowId) {
          windowManager.closeWindow(windowManager.activeWindowId);
        }
      }
      
      // Ctrl+W
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (windowManager.activeWindowId) {
          windowManager.closeWindow(windowManager.activeWindowId);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.altKey) {
        setAltTabOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [windowManager, handleOpenApp, showNotification]);

  // Alt+Tab window switcher
  const visibleWindows = useMemo(() => 
    windowManager.windows.filter(w => !w.isMinimized).reverse(),
    [windowManager.windows]
  );

  const wallpaperGradient = useMemo(() => 
    WALLPAPERS.find(w => w.id === settings.wallpaper)?.color || WALLPAPERS[0].color,
    [settings.wallpaper]
  );

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} user={{ name: settings.username || 'Admin' }} />;
  }

  return (
    <div 
      className={`h-screen w-screen overflow-hidden select-none font-sans bg-gradient-to-br ${wallpaperGradient} relative`}
      onContextMenu={(e) => handleContextMenu(e, null)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Selection Box Visual */}
      {selectionBox && selectionBox.visible && (
        <div 
          className="absolute border border-blue-500 bg-blue-400/20 z-0 pointer-events-none"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.x),
            top: Math.min(selectionBox.startY, selectionBox.y),
            width: Math.abs(selectionBox.x - selectionBox.startX),
            height: Math.abs(selectionBox.y - selectionBox.startY),
          }}
        />
      )}

      {/* Desktop Icons */}
      <div className="absolute inset-0 p-2 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-2 w-fit content-start pointer-events-none z-0">
        {desktopItems.map(item => (
          <div key={item.id} className="pointer-events-auto" onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, item.id); }}>
             <DesktopIcon item={item} onOpen={() => handleOpenFile(item)} />
          </div>
        ))}
      </div>

      {/* Windows */}
      {windowManager.windows.map(win => (
        <WindowFrame
          key={win.id}
          window={win}
          active={windowManager.activeWindowId === win.id}
          onClose={() => windowManager.closeWindow(win.id)}
          onMinimize={() => windowManager.toggleMinimize(win.id)}
          onMaximize={() => windowManager.toggleMaximize(win.id)}
          onFocus={() => windowManager.focusWindow(win.id)}
          onPositionUpdate={(x, y) => windowManager.updateWindowPosition(win.id, x, y)}
          onSizeUpdate={(w, h) => windowManager.updateWindowSize(win.id, w, h)}
        >
          {win.appId === 'explorer' && (
            <Explorer 
              fs={fileSystem.files} 
              setFs={fileSystem.setFiles} 
              initialPath={win.data?.initialPath || 'root'} 
              onOpen={handleOpenFile}
              onRename={fileSystem.renameFile}
              onDelete={fileSystem.deleteFile}
              onCopy={handleCopy}
              onCut={handleCut}
              onPaste={handlePaste}
              clipboardFiles={clipboard.clipboard?.files || []}
              hasClipboard={clipboard.hasClipboard}
            />
          )}
          {win.appId === 'settings' && <SettingsApp settings={settings} setSettings={setSettings} />}
          {win.appId === 'notepad' && (
            <Notepad 
              fileId={win.data?.id} 
              initialContent={win.data?.content} 
              onSave={fileSystem.updateFileContent} 
            />
          )}
          {win.appId === 'photos' && <PhotoViewer src={win.data?.src} name={win.data?.name} />}
          {win.appId === 'edge' && <Browser initialUrl={win.data?.initialUrl} />}
          {win.appId === 'calculator' && <Calculator />}
          {win.appId === 'paint' && <Paint />}
          {win.appId === 'terminal' && <Terminal />}
        </WindowFrame>
      ))}

      {/* Alt+Tab Switcher */}
      {altTabOpen && visibleWindows.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10001] flex items-center justify-center"
          onClick={() => setAltTabOpen(false)}
        >
          <div 
            className="bg-white/90 backdrop-blur-xl rounded-lg shadow-2xl p-4 min-w-[400px] max-w-[600px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-gray-500 mb-3">Press Tab to switch</div>
            <div className="grid grid-cols-4 gap-3">
              {visibleWindows.map((win, index) => (
                <button
                  key={win.id}
                  onClick={() => {
                    windowManager.focusWindow(win.id);
                    setAltTabOpen(false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    index === 0 ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">{win.icon}</div>
                    <span className="text-xs font-medium">{win.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />
      )}

      {/* Start Menu */}
      {startMenuOpen && (
        <StartMenu 
          apps={APPS} 
          onAppClick={handleOpenApp} 
          settings={settings}
          onLogout={() => { setIsLoggedIn(false); setStartMenuOpen(false); }}
        />
      )}

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      {/* File Properties */}
      {propertiesFile && (
        <FileProperties 
          file={propertiesFile} 
          onClose={() => setPropertiesFile(null)} 
        />
      )}

      {/* Taskbar */}
      <Taskbar
        startMenuOpen={startMenuOpen}
        onStartMenuToggle={() => setStartMenuOpen(!startMenuOpen)}
        apps={APPS}
        windows={windowManager.windows}
        activeWindowId={windowManager.activeWindowId}
        onAppClick={handleOpenApp}
        onWindowFocus={windowManager.focusWindow}
        onWindowMinimize={windowManager.toggleMinimize}
        time={time}
        settings={settings}
        onSettingsClick={() => handleOpenApp('settings')}
        onMinimizeAll={windowManager.minimizeAll}
      />
    </div>
  );
}
