'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import { 
  Monitor, HardDrive, FileText, Folder, Settings, X, Minus, Square, 
  Power, Search, Grid, Clock, ChevronRight, Image as ImageIcon, 
  Trash2, Plus, ArrowLeft, Maximize2, Check
} from 'lucide-react';

// --- Types ---
interface Wallpaper {
  id: string;
  color: string;
  name: string;
}

interface File {
  id: string;
  parentId: string;
  name: string;
  type: 'file' | 'folder';
  system?: boolean;
  content?: string;
}

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: string;
}

interface Window {
  id: string;
  appId: string;
  title: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  pathId?: string | null;
}

interface Settings {
  wallpaper: string;
  theme: 'light' | 'dark';
  time24h: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  options: Array<{
    label?: string;
    icon?: React.ReactNode;
    action?: () => void;
    divider?: boolean;
  }>;
}

// --- Constants & Initial Data ---
const WALLPAPERS: Wallpaper[] = [
  { id: 'blue', color: 'from-blue-500 to-cyan-400', name: 'Windows Blue' },
  { id: 'dark', color: 'from-slate-800 to-slate-900', name: 'Dark Void' },
  { id: 'nature', color: 'from-emerald-500 to-teal-700', name: 'Emerald Forest' },
  { id: 'sunset', color: 'from-orange-400 to-pink-600', name: 'Sunset Gradient' },
];

const INITIAL_FILES: File[] = [
  // System Folders
  { id: 'desktop', parentId: 'root', name: 'Desktop', type: 'folder', system: true },
  { id: 'documents', parentId: 'root', name: 'Documents', type: 'folder', system: true },
  { id: 'downloads', parentId: 'root', name: 'Downloads', type: 'folder', system: true },
  { id: 'recycle', parentId: 'root', name: 'Recycle Bin', type: 'folder', system: true },
  
  // Desktop Items
  { id: 'f1', parentId: 'desktop', name: 'Project Proposal', type: 'file', content: 'Project Phoenix...' },
  { id: 'fd1', parentId: 'desktop', name: 'My Photos', type: 'folder' },
  
  // Documents Items
  { id: 'f2', parentId: 'documents', name: 'Resume.txt', type: 'file', content: 'Frontend Developer...' },
];

const APPS: App[] = [
  { id: 'explorer', name: 'File Explorer', icon: <Folder className="text-yellow-500" />, component: 'Explorer' },
  { id: 'settings', name: 'Settings', icon: <Settings className="text-gray-500" />, component: 'Settings' },
  { id: 'notepad', name: 'Notepad', icon: <FileText className="text-blue-500" />, component: 'Notepad' },
];

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date: Date, format12h: boolean) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format12h
  });
};

// --- Components ---
// 1. Window Frame Component (Draggable & Resizable simulation)
interface WindowFrameProps {
  window: Window;
  active: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const WindowFrame = ({ window, active, onClose, onMinimize, onMaximize, onFocus, children }: WindowFrameProps) => {
  const [position, setPosition] = useState({ x: window.x, y: window.y });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Sync position if maximized changes externally or initial load
    if (window.isMaximized) {
      setPosition({ x: 0, y: 0 });
    } else {
      setPosition({ x: window.x, y: window.y });
    }
  }, [window.isMaximized, window.x, window.y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (window.isMinimized) return null;

  return (
    <div
      className={`absolute flex flex-col bg-white/90 backdrop-blur-md shadow-2xl rounded-lg overflow-hidden border border-white/40 transition-shadow duration-200
        ${window.isMaximized ? 'w-full h-[calc(100vh-48px)] top-0 left-0 rounded-none' : 'rounded-lg'}
        ${active ? 'z-50 ring-1 ring-blue-400/50 shadow-blue-500/20' : 'z-10'}
      `}
      style={{
        width: window.isMaximized ? '100%' : window.w,
        height: window.isMaximized ? '100%' : window.h,
        transform: window.isMaximized ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        zIndex: window.zIndex
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div 
        className="h-10 bg-gray-100/50 flex items-center justify-between px-3 select-none cursor-default border-b border-gray-200"
        onDoubleClick={onMaximize}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {window.icon}
          <span>{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="p-1.5 hover:bg-gray-200 rounded"><Minus size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="p-1.5 hover:bg-gray-200 rounded"><Square size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1.5 hover:bg-red-500 hover:text-white rounded"><X size={14} /></button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white/50 relative">
        {children}
      </div>
    </div>
  );
};

// 2. Apps Implementation
interface ExplorerProps {
  fs: File[];
  setFs: React.Dispatch<React.SetStateAction<File[]>>;
  initialPath?: string | null;
}

const Explorer = ({ fs, setFs, initialPath }: ExplorerProps) => {
  const [currentPathId, setCurrentPathId] = useState(initialPath || 'root');
  const [history, setHistory] = useState<string[]>(['root']);
  const [selection, setSelection] = useState<string | null>(null);

  // Quick Access Links
  const sideBarItems = INITIAL_FILES.filter(f => f.parentId === 'root');
  const currentFolder = fs.find(f => f.id === currentPathId) || { name: 'This PC' };
  const filesInFolder = fs.filter(f => f.parentId === currentPathId);

  const navigateTo = (id: string) => {
    setHistory([...history, id]);
    setCurrentPathId(id);
    setSelection(null);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentPathId(newHistory[newHistory.length - 1]);
    }
  };

  const createFolder = () => {
    const newFolder: File = {
      id: generateId(),
      parentId: currentPathId,
      name: `New Folder ${filesInFolder.length + 1}`,
      type: 'folder'
    };
    setFs([...fs, newFolder]);
  };

  const deleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Simplified delete: doesn't delete recursive children in this mock version
    setFs(fs.filter(f => f.id !== id));
  };

  return (
    <div className="flex h-full text-sm">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50/50 border-r border-gray-200 p-2 flex flex-col gap-1">
        <div className="font-semibold px-2 py-1 text-gray-500 text-xs uppercase tracking-wider">Favorites</div>
        {sideBarItems.map(item => (
          <button 
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left ${currentPathId === item.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}
          >
            {item.id === 'desktop' ? <Monitor size={16} /> : 
             item.id === 'documents' ? <FileText size={16} /> : 
             item.id === 'downloads' ? <ArrowLeft size={16} className="rotate-[-90deg]" /> :
             <Folder size={16} />}
            {item.name}
          </button>
        ))}
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-gray-200 flex items-center px-2 gap-2 bg-white">
          <button onClick={goBack} disabled={history.length <= 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 border border-gray-300 rounded px-2 py-1 text-gray-600 flex items-center gap-1">
             <Monitor size={14} />
             <ChevronRight size={14} className="text-gray-400" />
             <span>{currentFolder.name}</span>
          </div>
          <button onClick={createFolder} className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200">
            <Plus size={14} /> <span className="text-xs">New</span>
          </button>
        </div>
        {/* File Grid */}
        <div className="flex-1 p-4 grid grid-cols-4 md:grid-cols-6 gap-4 content-start" onClick={() => setSelection(null)}>
          {filesInFolder.map(file => (
            <div 
              key={file.id}
              onClick={(e) => { e.stopPropagation(); setSelection(file.id); }}
              onDoubleClick={() => file.type === 'folder' ? navigateTo(file.id) : null}
              onContextMenu={(e) => e.preventDefault()}
              className={`flex flex-col items-center gap-2 p-2 rounded border group cursor-default
                ${selection === file.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}
            >
              <div className="w-12 h-12 flex items-center justify-center text-gray-600">
                {file.type === 'folder' ? 
                  <Folder size={40} className="text-yellow-400 fill-yellow-400" /> : 
                  <FileText size={40} className="text-blue-400" />
                }
              </div>
              <span className="text-xs text-center break-all line-clamp-2 px-1 w-full">{file.name}</span>
            </div>
          ))}
          {filesInFolder.length === 0 && (
            <div className="col-span-full text-center text-gray-400 mt-10">Folder is empty</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SettingsAppProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsApp = ({ settings, setSettings }: SettingsAppProps) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-light mb-6">Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Personalization</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <label className="block text-sm font-medium mb-3">Desktop Background</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {WALLPAPERS.map(wp => (
              <button
                key={wp.id}
                onClick={() => setSettings({...settings, wallpaper: wp.id})}
                className={`aspect-video rounded-md overflow-hidden ring-offset-2 transition-all bg-gradient-to-br ${wp.color}
                  ${settings.wallpaper === wp.id ? 'ring-2 ring-blue-500 scale-95' : 'hover:scale-105'}
                `}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold drop-shadow-md">
                  {settings.wallpaper === wp.id && <Check size={20} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">System</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dark Mode (Experimental)</span>
            <button 
              onClick={() => setSettings({...settings, theme: settings.theme === 'light' ? 'dark' : 'light'})}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.theme === 'dark' ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">24-Hour Time</span>
             <button 
              onClick={() => setSettings({...settings, time24h: !settings.time24h})}
              className={`w-11 h-6 rounded-full transition-colors relative ${settings.time24h ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.time24h ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. System Components
interface DesktopIconProps {
  item: File;
  onOpen: () => void;
}

const DesktopIcon = ({ item, onOpen }: DesktopIconProps) => (
  <div 
    onDoubleClick={onOpen}
    className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 w-[84px] cursor-default group active:scale-95 transition-transform"
  >
    {item.type === 'folder' ? 
      <Folder size={42} className="text-yellow-400 fill-yellow-400 drop-shadow-md" /> : 
      <FileText size={42} className="text-blue-100 drop-shadow-md" />
    }
    <span className="text-white text-xs text-center drop-shadow-md line-clamp-2 px-1 group-hover:bg-blue-700/50 rounded leading-tight">
      {item.name}
    </span>
  </div>
);

interface TaskbarItemProps {
  app: App;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

const TaskbarItem = ({ app, isOpen, isActive, onClick }: TaskbarItemProps) => (
  <button 
    onClick={onClick}
    className={`
      h-10 w-10 flex items-center justify-center rounded transition-all relative group
      ${isOpen ? 'bg-white/10' : 'hover:bg-white/5'}
      ${isActive ? 'bg-white/20' : ''}
    `}
  >
    <div className="transform transition-transform group-hover:-translate-y-1">
      {app.icon}
    </div>
    {isOpen && (
      <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400 w-3' : 'bg-gray-400'} transition-all`} />
    )}
  </button>
);

interface ContextMenuProps {
  x: number;
  y: number;
  options: Array<{
    label?: string;
    icon?: React.ReactNode;
    action?: () => void;
    divider?: boolean;
  }>;
  onClose: () => void;
}

const ContextMenu = ({ x, y, options, onClose }: ContextMenuProps) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="fixed bg-white/90 backdrop-blur-xl border border-white/20 rounded-md shadow-2xl py-1 w-48 z-[9999] animate-in fade-in zoom-in-95 duration-75"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((opt, i) => (
        <React.Fragment key={i}>
          {opt.divider ? <div className="h-px bg-gray-200 my-1" /> : (
            <button 
              onClick={() => { opt.action?.(); onClose(); }}
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-500 hover:text-white flex items-center gap-2"
            >
              {opt.icon && <span className="w-4">{opt.icon}</span>}
              {opt.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  // Global State
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(100);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  
  // Persisted State
  const [files, setFiles] = useState<File[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('os_files');
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    }
    return INITIAL_FILES;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('os_settings');
      return saved ? JSON.parse(saved) : { wallpaper: 'blue', theme: 'light', time24h: false };
    }
    return { wallpaper: 'blue', theme: 'light', time24h: false };
  });

  // Effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('os_files', JSON.stringify(files));
    }
  }, [files]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('os_settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Current Time
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Window Manager Functions
  const openApp = (appId: string, pathId: string | null = null) => {
    const appInfo = APPS.find(a => a.id === appId);
    if (!appInfo) return;

    // Check if instance exists (simplified: allow multiple explorers, but single settings)
    const existing = windows.find(w => w.appId === appId && appId !== 'explorer');
    if (existing) {
      focusWindow(existing.id);
      if (existing.isMinimized) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      }
      return;
    }

    const newWindow: Window = {
      id: generateId(),
      appId,
      title: appInfo.name,
      icon: appInfo.icon,
      x: 50 + (windows.length * 20),
      y: 50 + (windows.length * 20),
      w: 800,
      h: 500,
      zIndex: zIndexCounter + 1,
      isMinimized: false,
      isMaximized: false,
      pathId // For explorer initial path
    };

    setZIndexCounter(prev => prev + 1);
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setZIndexCounter(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter + 1 } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isMinimized: !w.isMinimized };
      }
      return w;
    }));
  };

  const toggleMaximize = (id: string) => {
     setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  // Context Menu Handlers
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        { label: 'View', action: () => {} },
        { label: 'Sort by', action: () => {} },
        { divider: true },
        { label: 'New Folder', icon: <Folder size={14}/>, action: () => {
          const newFolder: File = { id: generateId(), parentId: 'desktop', name: 'New Folder', type: 'folder' };
          setFiles([...files, newFolder]);
        }},
        { divider: true },
        { label: 'Personalize', icon: <Settings size={14}/>, action: () => openApp('settings') },
      ]
    });
  };

  // Derived Data
  const desktopItems = files.filter(f => f.parentId === 'desktop');
  const wallpaperGradient = WALLPAPERS.find(w => w.id === settings.wallpaper)?.color || WALLPAPERS[0].color;

  return (
    <div 
      className={`h-screen w-screen overflow-hidden select-none font-sans bg-gradient-to-br ${wallpaperGradient} relative`}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        setStartMenuOpen(false);
        setContextMenu(null);
      }}
    >
      {/* Desktop Icons Area */}
      <div className="p-2 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-2 w-fit content-start h-[calc(100vh-48px)]">
        {desktopItems.map(item => (
          <DesktopIcon 
            key={item.id} 
            item={item} 
            onOpen={() => {
              if (item.type === 'folder') {
                openApp('explorer', item.id); // In real app, pass path
              } else {
                 openApp('notepad'); // Just mock open
              }
            }}
          />
        ))}
      </div>

      {/* Windows Layer */}
      {windows.map(win => (
        <WindowFrame
          key={win.id}
          window={win}
          active={activeWindowId === win.id}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => toggleMinimize(win.id)}
          onMaximize={() => toggleMaximize(win.id)}
          onFocus={() => focusWindow(win.id)}
        >
          {win.appId === 'explorer' && <Explorer fs={files} setFs={setFiles} initialPath={win.pathId} />}
          {win.appId === 'settings' && <SettingsApp settings={settings} setSettings={setSettings} />}
          {win.appId === 'notepad' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-4 p-1 text-sm border-b bg-gray-50">
                <span>File</span><span>Edit</span><span>Format</span><span>View</span>
              </div>
              <textarea className="flex-1 resize-none p-2 outline-none font-mono text-sm" placeholder="Type something..." />
            </div>
          )}
        </WindowFrame>
      ))}

      {/* Context Menu Overlay */}
      {contextMenu && (
        <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />
      )}

      {/* Start Menu (Popup) */}
      {startMenuOpen && (
        <div 
          className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[600px] h-[650px] bg-white/80 backdrop-blur-xl rounded-lg shadow-2xl border border-white/40 z-[9998] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Type here to search" 
                className="w-full bg-gray-100/50 border border-gray-300/50 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Pinned</h3>
              <button className="text-xs bg-white/50 px-2 py-0.5 rounded border shadow-sm">All apps &gt;</button>
            </div>
            
            <div className="grid grid-cols-6 gap-4 mb-8">
              {APPS.map(app => (
                <button 
                  key={app.id} 
                  onClick={() => openApp(app.id)}
                  className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/50 transition-colors group"
                >
                  <div className="transform transition-transform group-active:scale-95">{app.icon}</div>
                  <span className="text-xs text-gray-600 font-medium">{app.name}</span>
                </button>
              ))}
              {/* Mock Apps */}
              <button className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/50 opacity-50"><Monitor size={24} /><span className="text-xs">Edge</span></button>
              <button className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/50 opacity-50"><Grid size={24} /><span className="text-xs">Excel</span></button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Recommended</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-3 p-2 hover:bg-white/50 rounded cursor-pointer">
                <FileText className="text-blue-500" size={20} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Project_Specs.pdf</span>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-white/50 rounded cursor-pointer">
                <ImageIcon className="text-purple-500" size={20} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Design_Mockup.png</span>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-auto bg-gray-100/50 p-4 border-t border-gray-200/50 flex justify-between items-center px-8">
             <div className="flex items-center gap-3 hover:bg-white/50 p-2 rounded cursor-pointer">
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">U</div>
               <span className="text-sm font-medium">User</span>
             </div>
             <button className="p-2 hover:bg-white/50 rounded text-gray-600 hover:text-red-500">
               <Power size={20} />
             </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div 
        className="absolute bottom-0 w-full h-12 bg-white/85 backdrop-blur-xl border-t border-white/40 flex justify-between items-center px-4 z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1" /> {/* Spacer Left */}
        
        {/* Center Dock */}
        <div className="flex items-center gap-1">
          <button 
            className={`p-2 rounded hover:bg-white/40 transition-all ${startMenuOpen ? 'bg-white/50' : ''}`}
            onClick={() => setStartMenuOpen(!startMenuOpen)}
          >
            <Grid className="text-blue-600 fill-blue-600" size={24} />
          </button>
          
          {APPS.map(app => {
            const isRunning = windows.some(w => w.appId === app.id);
            const isActive = activeWindowId && windows.find(w => w.id === activeWindowId)?.appId === app.id;
            
            return (
              <TaskbarItem 
                key={app.id}
                app={app} 
                isOpen={isRunning}
                isActive={!!isActive}
                onClick={() => {
                  if (isRunning) {
                    const win = windows.find(w => w.appId === app.id);
                    if (win && win.id === activeWindowId && !win.isMinimized) {
                      toggleMinimize(win.id);
                    } else if (win) {
                      focusWindow(win.id);
                      if (win.isMinimized) toggleMinimize(win.id);
                    }
                  } else {
                    openApp(app.id);
                  }
                }}
              />
            );
          })}
        </div>
        <div className="flex-1 flex justify-end">
          {/* System Tray */}
          <div className="flex items-center gap-2 px-2 hover:bg-white/40 rounded cursor-default" onClick={() => openApp('settings')}>
            <div className="text-right">
               <div className="text-xs font-medium text-gray-800">{formatDate(time, !settings.time24h)}</div>
               <div className="text-[10px] text-gray-600">{time.toLocaleDateString()}</div>
            </div>
            <Clock size={16} className="text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
