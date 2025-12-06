'use client';

import React from 'react';
import { Folder, FileText, Image as ImageIcon, Globe } from 'lucide-react';
import { File } from '../types';

interface DesktopIconProps {
  item: File;
  onOpen: () => void;
}

export const DesktopIcon = React.memo(({ item, onOpen }: DesktopIconProps) => (
  <div 
    onDoubleClick={onOpen}
    className="flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 w-[84px] cursor-default group active:scale-95 transition-transform"
    role="button"
    aria-label={`${item.type} ${item.name}`}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen();
      }
    }}
  >
    <div className="relative">
      {item.type === 'folder' ? <Folder size={42} className="text-yellow-400 fill-yellow-400 drop-shadow-md" /> : 
       item.type === 'image' ? <ImageIcon size={42} className="text-purple-400 drop-shadow-md" /> :
       item.type === 'web' ? <div className="bg-white rounded-full p-1"><Globe size={34} className="text-blue-500" /></div> :
       <FileText size={42} className="text-blue-100 drop-shadow-md" />
      }
    </div>
    <span className="text-white text-xs text-center drop-shadow-md line-clamp-2 px-1 bg-black/0 group-hover:bg-black/20 rounded leading-tight transition-colors">
      {item.name}
    </span>
  </div>
));

DesktopIcon.displayName = 'DesktopIcon';
