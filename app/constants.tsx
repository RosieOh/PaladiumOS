'use client';

import React from 'react';
import { Folder, Settings, FileText, Globe, Image as ImageIcon, Calculator, Paintbrush, Terminal as TerminalIcon } from 'lucide-react';
import { Wallpaper, File, App } from './types';

export const WALLPAPERS: Wallpaper[] = [
  { id: 'blue', color: 'from-blue-600 to-blue-400', name: 'Windows Blue' },
  { id: 'dark', color: 'from-slate-900 to-slate-800', name: 'Dark Void' },
  { id: 'nature', color: 'from-emerald-600 to-emerald-400', name: 'Emerald Forest' },
  { id: 'sunset', color: 'from-orange-500 to-pink-500', name: 'Sunset Gradient' },
];

export const INITIAL_FILES: File[] = [
  // System Folders
  { id: 'desktop', parentId: 'root', name: 'Desktop', type: 'folder', system: true },
  { id: 'documents', parentId: 'root', name: 'Documents', type: 'folder', system: true },
  { id: 'downloads', parentId: 'root', name: 'Downloads', type: 'folder', system: true },
  { id: 'recycle', parentId: 'root', name: 'Recycle Bin', type: 'folder', system: true },
  
  // Desktop Items
  { id: 'f1', parentId: 'desktop', name: 'Project Proposal.txt', type: 'file', content: 'Project Phoenix...\n\nPhase 1: Ideation\nPhase 2: Development\nPhase 3: Launch' },
  { id: 'fd1', parentId: 'desktop', name: 'My Photos', type: 'folder' },
  { id: 'w1', parentId: 'desktop', name: 'Google', type: 'web', url: 'https://www.google.com/webhp?igu=1' },
  
  // Documents Items
  { id: 'f2', parentId: 'documents', name: 'Resume.txt', type: 'file', content: 'Frontend Developer\n\nSkills:\n- React\n- Tailwind\n- Node.js' },
  
  // Photos
  { id: 'p1', parentId: 'fd1', name: 'Mountain.jpg', type: 'image', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 'p2', parentId: 'fd1', name: 'Ocean.jpg', type: 'image', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
];

export const APPS: App[] = [
  { id: 'explorer', name: 'File Explorer', icon: <Folder className="text-yellow-500" />, component: 'Explorer' },
  { id: 'edge', name: 'Edge', icon: <Globe className="text-blue-500" />, component: 'Browser' },
  { id: 'calculator', name: 'Calculator', icon: <Calculator className="text-orange-500" />, component: 'Calculator' },
  { id: 'paint', name: 'Paint', icon: <Paintbrush className="text-pink-500" />, component: 'Paint' },
  { id: 'terminal', name: 'Terminal', icon: <TerminalIcon className="text-green-500" />, component: 'Terminal' },
  { id: 'settings', name: 'Settings', icon: <Settings className="text-gray-500" />, component: 'Settings' },
  { id: 'notepad', name: 'Notepad', icon: <FileText className="text-blue-500" />, component: 'Notepad' },
  { id: 'photos', name: 'Photos', icon: <ImageIcon className="text-purple-500" />, component: 'PhotoViewer' },
];

