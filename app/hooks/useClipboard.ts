import { useState, useCallback } from 'react';
import { File } from '../types';

export interface ClipboardItem {
  type: 'copy' | 'cut';
  files: File[];
}

export const useClipboard = () => {
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);

  const copy = useCallback((files: File[]) => {
    setClipboard({ type: 'copy', files });
  }, []);

  const cut = useCallback((files: File[]) => {
    setClipboard({ type: 'cut', files });
  }, []);

  const paste = useCallback((targetParentId: string, onPaste: (files: File[], targetParentId: string, isCut: boolean) => void) => {
    if (clipboard && clipboard.files.length > 0) {
      onPaste(clipboard.files, targetParentId, clipboard.type === 'cut');
      if (clipboard.type === 'cut') {
        setClipboard(null);
      }
    }
  }, [clipboard]);

  const clear = useCallback(() => {
    setClipboard(null);
  }, []);

  const hasClipboard = clipboard !== null && clipboard.files.length > 0;

  return {
    clipboard,
    copy,
    cut,
    paste,
    clear,
    hasClipboard
  };
};

