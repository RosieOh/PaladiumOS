'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface NotepadProps {
  fileId?: string;
  initialContent?: string;
  onSave?: (fileId: string, content: string) => void;
}

export const Notepad = React.memo(({ fileId, initialContent = '', onSave }: NotepadProps) => {
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent !== content && !isDirty) {
      setContent(initialContent);
    }
  }, [initialContent, isDirty]);

  const handleSave = () => {
    if (fileId && onSave) {
      onSave(fileId, content);
      setIsDirty(false);
    }
  };

  const lineCount = useMemo(() => content.split('\n').length, [content]);
  const charCount = useMemo(() => content.length, [content]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center gap-2 p-1 text-xs border-b bg-gray-50">
        <button 
          className="px-2 py-1 hover:bg-gray-200 rounded" 
          onClick={handleSave}
          aria-label="Save file"
        >
          File
        </button>
        <button className="px-2 py-1 hover:bg-gray-200 rounded" aria-label="Edit menu">Edit</button>
        <button className="px-2 py-1 hover:bg-gray-200 rounded" aria-label="View menu">View</button>
        {isDirty && <span className="ml-auto text-gray-400 italic pr-2" aria-live="polite">Unsaved</span>}
      </div>
      <textarea 
        className="flex-1 resize-none p-4 outline-none font-mono text-sm leading-relaxed" 
        placeholder="Type something..." 
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsDirty(true);
        }}
        onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
          }
        }}
        aria-label="Text editor"
      />
      <div className="h-6 border-t bg-gray-50 flex items-center justify-end px-2 text-xs text-gray-500 gap-4">
        <span>Ln {lineCount}, Col {charCount}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
});

Notepad.displayName = 'Notepad';
