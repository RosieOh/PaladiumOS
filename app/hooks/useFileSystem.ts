import { useState, useCallback } from 'react';
import { File, WindowData } from '../types';
import { INITIAL_FILES } from '../constants';
import { generateId, getLocalStorage, setLocalStorage } from '../utils';

export const useFileSystem = () => {
  const [files, setFiles] = useState<File[]>(() => 
    getLocalStorage('os_files_v2', INITIAL_FILES)
  );

  // Save to localStorage whenever files change
  const updateFiles = useCallback((newFiles: File[] | ((prev: File[]) => File[])) => {
    setFiles(prev => {
      const updated = typeof newFiles === 'function' ? newFiles(prev) : newFiles;
      setLocalStorage('os_files_v2', updated);
      return updated;
    });
  }, []);

  const createNewFile = useCallback((type: 'folder' | 'file', parentId: string) => {
    const baseName = type === 'folder' ? 'New Folder' : 'New Text Document.txt';
    const newFile: File = {
      id: generateId(),
      parentId,
      name: baseName,
      type: type === 'folder' ? 'folder' : 'file',
      content: ''
    };
    setFiles(prev => {
      const updated = [...prev, newFile];
      setLocalStorage('os_files_v2', updated);
      return updated;
    });
    return newFile;
  }, []);

  const updateFileContent = useCallback((fileId: string, newContent: string) => {
    setFiles(prev => {
      const updated = prev.map(f => f.id === fileId ? { ...f, content: newContent } : f);
      setLocalStorage('os_files_v2', updated);
      return updated;
    });
  }, []);

  const deleteFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.parentId === 'recycle') {
      setFiles(prev => {
        const updated = prev.filter(f => f.id !== id);
        setLocalStorage('os_files_v2', updated);
        return updated;
      });
    } else {
      setFiles(prev => {
        const updated = prev.map(f => f.id === id ? { ...f, parentId: 'recycle' } : f);
        setLocalStorage('os_files_v2', updated);
        return updated;
      });
    }
  }, [files]);

  const renameFile = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    setFiles(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, name: newName } : f);
      setLocalStorage('os_files_v2', updated);
      return updated;
    });
  }, []);

  const openFile = useCallback((file: File): WindowData | null => {
    if (file.type === 'folder') {
      return { initialPath: file.id, name: file.name };
    } else if (file.type === 'image') {
      return { src: file.src, name: file.name };
    } else if (file.type === 'web') {
      return { initialUrl: file.url, name: 'Edge' };
    } else {
      return { id: file.id, content: file.content, name: file.name };
    }
  }, []);

  return {
    files,
    setFiles: updateFiles,
    createNewFile,
    updateFileContent,
    deleteFile,
    renameFile,
    openFile
  };
};

