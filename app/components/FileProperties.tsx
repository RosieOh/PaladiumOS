'use client';

import React from 'react';
import { File } from '../types';
import { X, FileText, Folder, Image as ImageIcon, Globe } from 'lucide-react';

interface FilePropertiesProps {
  file: File;
  onClose: () => void;
}

export const FileProperties = React.memo(({ file, onClose }: FilePropertiesProps) => {
  const getFileIcon = () => {
    switch (file.type) {
      case 'folder':
        return <Folder className="text-yellow-500" size={48} />;
      case 'image':
        return <ImageIcon className="text-purple-500" size={48} />;
      case 'web':
        return <Globe className="text-blue-500" size={48} />;
      default:
        return <FileText className="text-blue-500" size={48} />;
    }
  };

  const getFileSize = () => {
    if (file.type === 'folder') return 'Folder';
    if (file.content) {
      const size = new Blob([file.content]).size;
      if (size < 1024) return `${size} bytes`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
    return 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10002] flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl w-[500px] max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="File properties"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Properties</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* File Icon and Name */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium truncate">{file.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{file.type}</p>
            </div>
          </div>

          {/* Properties */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">General</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{file.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{getFileSize()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{file.id}</span>
                </div>
                {file.parentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{file.parentId}</span>
                  </div>
                )}
                {file.system && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">System:</span>
                    <span className="font-medium">Yes</span>
                  </div>
                )}
              </div>
            </div>

            {file.content && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Preview</h4>
                <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-32 overflow-auto">
                  {file.content.substring(0, 200)}
                  {file.content.length > 200 && '...'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FileProperties.displayName = 'FileProperties';

