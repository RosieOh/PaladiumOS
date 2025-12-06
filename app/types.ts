import React from 'react';

export interface Wallpaper {
  id: string;
  color: string;
  name: string;
}

export interface File {
  id: string;
  parentId: string;
  name: string;
  type: 'file' | 'folder' | 'image' | 'web';
  system?: boolean;
  content?: string;
  url?: string;
  src?: string;
}

export interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: string;
}

export interface WindowData {
  id?: string;
  name?: string;
  content?: string;
  src?: string;
  url?: string;
  initialPath?: string;
  initialUrl?: string;
}

export interface Window {
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
  data?: WindowData; // For passing file data or props to apps
}

export interface Settings {
  wallpaper: string;
  theme: 'light' | 'dark';
  time24h: boolean;
  username?: string;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  x: number;
  y: number;
  visible: boolean;
}

export interface ContextMenuOption {
  label?: string;
  icon?: React.ReactNode;
  action?: () => void;
  divider?: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  options: ContextMenuOption[];
}

