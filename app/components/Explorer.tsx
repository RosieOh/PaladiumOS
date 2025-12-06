'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Monitor, FileText, Folder, ArrowLeft, ChevronRight, Trash2, Image as ImageIcon, Globe, Search, List, Grid, Copy, Scissors, ArrowRight } from 'lucide-react';
import { File } from '../types';

export type ViewMode = 'grid' | 'list' | 'details';
export type SortOption = 'name' | 'type' | 'date' | 'size';

interface ExplorerProps {
  fs: File[];
  setFs: React.Dispatch<React.SetStateAction<File[]>>;
  initialPath?: string | null;
  onOpen?: (file: File) => void;
  onRename?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (files: File[]) => void;
  onCut?: (files: File[]) => void;
  onPaste?: (targetParentId: string) => void;
  clipboardFiles?: File[];
  hasClipboard?: boolean;
}

export const Explorer = React.memo(({ 
  fs, 
  setFs, 
  initialPath, 
  onOpen, 
  onRename, 
  onDelete,
  onCopy,
  onCut,
  onPaste,
  clipboardFiles = [],
  hasClipboard = false
}: ExplorerProps) => {
  const [currentPathId, setCurrentPathId] = useState(initialPath === 'root' ? 'desktop' : (initialPath || 'desktop'));
  const [history, setHistory] = useState([initialPath === 'root' ? 'desktop' : (initialPath || 'desktop')]);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortAscending, setSortAscending] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoized computed values
  const sideBarItems = useMemo(() => fs.filter(f => f.parentId === 'root'), [fs]);
  const currentFolder = useMemo(() => fs.find(f => f.id === currentPathId) || { name: 'This PC' }, [fs, currentPathId]);
  
  const allFilesInFolder = useMemo(() => fs.filter(f => f.parentId === currentPathId), [fs, currentPathId]);
  
  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFilesInFolder;
    const query = searchQuery.toLowerCase();
    return allFilesInFolder.filter(file => 
      file.name.toLowerCase().includes(query)
    );
  }, [allFilesInFolder, searchQuery]);

  // Sort files
  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'date':
          // For now, use name as date proxy
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          // For now, use name as size proxy
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortAscending ? comparison : -comparison;
    });
    
    // Folders first
    return sorted.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return 0;
    });
  }, [filteredFiles, sortOption, sortAscending]);

  const navigateTo = useCallback((id: string) => {
    if (id === currentPathId) return;
    setHistory(prev => [...prev, id]);
    setCurrentPathId(id);
    setSelection(new Set());
    setRenamingId(null);
    setSearchQuery('');
  }, [currentPathId]);

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop();
        setCurrentPathId(newHistory[newHistory.length - 1]);
        setSelection(new Set());
        return newHistory;
      }
      return prev;
    });
  }, []);

  const handleFileClick = useCallback((file: File, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl
      setSelection(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(file.id)) {
          newSelection.delete(file.id);
        } else {
          newSelection.add(file.id);
        }
        return newSelection;
      });
      setLastSelectedIndex(index);
    } else if (e.shiftKey && lastSelectedIndex !== null) {
      // Range select with Shift
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const newSelection = new Set(selection);
      for (let i = start; i <= end; i++) {
        if (sortedFiles[i]) {
          newSelection.add(sortedFiles[i].id);
        }
      }
      setSelection(newSelection);
    } else {
      // Single select
      setSelection(new Set([file.id]));
      setLastSelectedIndex(index);
    }
  }, [lastSelectedIndex, sortedFiles, selection]);

  const startRename = useCallback((file: File) => {
    setRenamingId(file.id);
    setRenameName(file.name);
  }, []);

  const handleRename = useCallback((id: string, newName: string) => {
    if (!newName.trim()) {
      setRenamingId(null);
      return;
    }
    if (onRename) {
      onRename(id, newName);
    } else {
      setFs(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    }
    setRenamingId(null);
  }, [onRename, setFs]);

  const handleDelete = useCallback((ids: string[]) => {
    ids.forEach(id => {
      if (onDelete) {
        onDelete(id);
      } else {
        const file = fs.find(f => f.id === id);
        if (file?.parentId === 'recycle') {
          setFs(prev => prev.filter(f => f.id !== id));
        } else {
          setFs(prev => prev.map(f => f.id === id ? { ...f, parentId: 'recycle' } : f));
        }
      }
    });
    setSelection(new Set());
  }, [fs, onDelete, setFs]);

  const handleCopy = useCallback(() => {
    if (selection.size > 0 && onCopy) {
      const selectedFiles = sortedFiles.filter(f => selection.has(f.id));
      onCopy(selectedFiles);
    }
  }, [selection, sortedFiles, onCopy]);

  const handleCut = useCallback(() => {
    if (selection.size > 0 && onCut) {
      const selectedFiles = sortedFiles.filter(f => selection.has(f.id));
      onCut(selectedFiles);
    }
  }, [selection, sortedFiles, onCut]);

  const handlePaste = useCallback(() => {
    if (hasClipboard && onPaste) {
      onPaste(currentPathId);
    }
  }, [hasClipboard, onPaste, currentPathId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (renamingId) return;
      
      if (e.key === 'F2' && selection.size === 1) {
        const fileId = Array.from(selection)[0];
        const file = fs.find(f => f.id === fileId);
        if (file) {
          e.preventDefault();
          startRename(file);
        }
      } else if (e.key === 'Delete' && selection.size > 0) {
        e.preventDefault();
        handleDelete(Array.from(selection));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelection(new Set(sortedFiles.map(f => f.id)));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        handleCut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, renamingId, fs, sortedFiles, startRename, handleDelete, handleCopy, handleCut, handlePaste, hasClipboard]);

  const selectedFiles = useMemo(() => 
    sortedFiles.filter(f => selection.has(f.id)),
    [sortedFiles, selection]
  );

  return (
    <div className="flex h-full text-sm select-none" tabIndex={0} ref={containerRef}>
      <div className="w-48 bg-gray-50/80 backdrop-blur-sm border-r border-gray-200 p-2 flex flex-col gap-1">
        <div className="font-semibold px-2 py-2 text-gray-500 text-[10px] uppercase tracking-wider">Quick Access</div>
        {sideBarItems.map(item => (
          <button 
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs font-medium transition-colors ${currentPathId === item.id ? 'bg-blue-100/80 text-blue-700' : 'hover:bg-gray-200/80 text-gray-700'}`}
            aria-label={`Navigate to ${item.name}`}
          >
            {item.id === 'desktop' ? <Monitor size={15} /> : 
             item.id === 'documents' ? <FileText size={15} /> : 
             item.id === 'downloads' ? <ArrowLeft size={15} className="rotate-[-90deg]" /> :
             <Trash2 size={15} />}
            {item.name}
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {/* Toolbar */}
        <div className="h-10 border-b border-gray-200 flex items-center px-2 gap-2 bg-white/50">
          <button 
            onClick={goBack} 
            disabled={history.length <= 1} 
            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 border border-gray-200 bg-gray-50 rounded-md px-3 py-1 text-gray-600 flex items-center gap-2 text-xs shadow-sm">
             <Monitor size={12} />
             <ChevronRight size={12} className="text-gray-400" />
             <span>{currentFolder.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 w-32"
                aria-label="Search files"
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none"
              aria-label="Sort by"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => setSortAscending(!sortAscending)}
              className="p-1 hover:bg-gray-200 rounded"
              aria-label={sortAscending ? "Sort ascending" : "Sort descending"}
            >
              {sortAscending ? '↑' : '↓'}
            </button>
            <div className="flex border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 ${viewMode === 'grid' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                aria-label="Grid view"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 ${viewMode === 'list' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                aria-label="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Context actions bar */}
        {selection.size > 0 && (
          <div className="h-8 border-b border-gray-200 bg-blue-50/50 flex items-center gap-2 px-2 text-xs">
            <span className="text-gray-700">{selection.size} item{selection.size > 1 ? 's' : ''} selected</span>
            <div className="flex gap-1 ml-auto">
              {onCopy && (
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 hover:bg-blue-100 rounded flex items-center gap-1"
                  title="Copy (Ctrl+C)"
                >
                  <Copy size={12} /> Copy
                </button>
              )}
              {onCut && (
                <button
                  onClick={handleCut}
                  className="px-2 py-1 hover:bg-blue-100 rounded flex items-center gap-1"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors size={12} /> Cut
                </button>
              )}
              {hasClipboard && onPaste && (
                <button
                  onClick={handlePaste}
                  className="px-2 py-1 hover:bg-blue-100 rounded flex items-center gap-1"
                  title="Paste (Ctrl+V)"
                >
                  <ArrowRight size={12} /> Paste
                </button>
              )}
            </div>
          </div>
        )}

        {/* File list */}
        <div 
          className="flex-1 overflow-auto"
          onClick={() => { setSelection(new Set()); setRenamingId(null); }}
        >
          {viewMode === 'grid' ? (
            <div className="p-4 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 content-start">
              {sortedFiles.length === 0 && (
                <div className="col-span-full text-center text-gray-400 mt-10">
                  {searchQuery ? 'No files found' : 'Folder is empty'}
                </div>
              )}
              {sortedFiles.map((file, index) => (
                <FileItem
                  key={file.id}
                  file={file}
                  index={index}
                  isSelected={selection.has(file.id)}
                  isRenaming={renamingId === file.id}
                  renameName={renameName}
                  onRenameNameChange={setRenameName}
                  onRename={handleRename}
                  onCancelRename={() => setRenamingId(null)}
                  onClick={(e) => handleFileClick(file, index, e)}
                  onDoubleClick={() => {
                    if (file.type === 'folder') {
                      navigateTo(file.id);
                    } else if (onOpen) {
                      onOpen(file);
                    }
                  }}
                  onStartRename={() => startRename(file)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="p-2">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-semibold text-gray-600">Name</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Type</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiles.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-gray-400 p-8">
                        {searchQuery ? 'No files found' : 'Folder is empty'}
                      </td>
                    </tr>
                  )}
                  {sortedFiles.map((file, index) => (
                    <tr
                      key={file.id}
                      onClick={(e) => handleFileClick(file, index, e)}
                      onDoubleClick={() => {
                        if (file.type === 'folder') {
                          navigateTo(file.id);
                        } else if (onOpen) {
                          onOpen(file);
                        }
                      }}
                      className={`cursor-pointer hover:bg-gray-50 ${selection.has(file.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-2 flex items-center gap-2">
                        {file.type === 'folder' ? <Folder size={16} className="text-yellow-400" /> : 
                         file.type === 'image' ? <ImageIcon size={16} className="text-purple-400" /> :
                         file.type === 'web' ? <Globe size={16} className="text-blue-400" /> :
                         <FileText size={16} className="text-blue-400" />}
                        {renamingId === file.id ? (
                          <input
                            autoFocus
                            value={renameName}
                            onChange={e => setRenameName(e.target.value)}
                            onBlur={() => handleRename(file.id, renameName)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleRename(file.id, renameName);
                              } else if (e.key === 'Escape') {
                                setRenamingId(null);
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 border border-blue-400 px-1 rounded"
                          />
                        ) : (
                          <span>{file.name}</span>
                        )}
                      </td>
                      <td className="p-2 text-gray-600">{file.type}</td>
                      <td className="p-2 text-gray-600">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Explorer.displayName = 'Explorer';

interface FileItemProps {
  file: File;
  index: number;
  isSelected: boolean;
  isRenaming: boolean;
  renameName: string;
  onRenameNameChange: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onCancelRename: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onStartRename: () => void;
  viewMode: ViewMode;
}

const FileItem = React.memo(({
  file,
  isSelected,
  isRenaming,
  renameName,
  onRenameNameChange,
  onRename,
  onCancelRename,
  onClick,
  onDoubleClick,
  onStartRename,
  viewMode
}: FileItemProps) => {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex flex-col items-center gap-1 p-2 rounded border transition-all duration-100 group cursor-default relative
        ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
      role="button"
      aria-label={`${file.type} ${file.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onDoubleClick();
        } else if (e.key === 'F2') {
          e.preventDefault();
          onStartRename();
        }
      }}
    >
      <div className="w-10 h-10 flex items-center justify-center text-gray-600 relative">
        {file.type === 'folder' ? <Folder size={36} className="text-yellow-400 fill-yellow-400" /> : 
         file.type === 'image' ? <ImageIcon size={36} className="text-purple-400" /> :
         file.type === 'web' ? <Globe size={36} className="text-blue-400" /> :
         <FileText size={36} className="text-blue-400" />
        }
      </div>
      
      {isRenaming ? (
        <input
          autoFocus
          value={renameName}
          onChange={e => onRenameNameChange(e.target.value)}
          onBlur={() => onRename(file.id, renameName)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onRename(file.id, renameName);
            } else if (e.key === 'Escape') {
              onCancelRename();
            }
          }}
          onClick={e => e.stopPropagation()}
          className="text-xs text-center w-full border border-blue-400 px-1 rounded bg-white z-10 shadow-md"
          aria-label="Rename file"
        />
      ) : (
        <span className="text-xs text-center break-all line-clamp-2 px-1 w-full text-gray-700 group-hover:text-gray-900">
          {file.name}
        </span>
      )}
    </div>
  );
});

FileItem.displayName = 'FileItem';
