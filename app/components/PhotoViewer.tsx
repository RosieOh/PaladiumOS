'use client';

import React from 'react';

interface PhotoViewerProps {
  src?: string;
  name?: string;
}

export const PhotoViewer = React.memo(({ src, name }: PhotoViewerProps) => (
  <div className="h-full flex flex-col bg-gray-900 text-white">
    <div className="flex-1 flex items-center justify-center overflow-hidden p-4" role="img" aria-label={name || 'Photo viewer'}>
      {src ? (
        <img src={src} alt={name || 'Photo'} className="max-w-full max-h-full object-contain shadow-2xl" />
      ) : (
        <div className="text-gray-400">No image to display</div>
      )}
    </div>
    <div className="h-12 bg-black/50 flex items-center justify-center gap-4 backdrop-blur-sm">
       <span className="text-sm font-light">{name || 'Untitled'}</span>
    </div>
  </div>
));

PhotoViewer.displayName = 'PhotoViewer';
