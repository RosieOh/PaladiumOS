'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

interface BrowserProps {
  initialUrl?: string;
}

export const Browser = React.memo(({ initialUrl }: BrowserProps) => {
  const [url, setUrl] = useState(initialUrl || 'https://www.google.com/webhp?igu=1');
  const [inputUrl, setInputUrl] = useState(url);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([url]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update inputUrl when url changes externally
  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  const navigate = useCallback((targetUrl: string) => {
    // Add protocol if missing
    let finalUrl = targetUrl;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    setUrl(finalUrl);
    setLoading(true);
    
    // Update history
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(finalUrl);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex]);

  const handleNavigate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputUrl);
  }, [inputUrl, navigate]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setLoading(true);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setLoading(true);
    }
  }, [history, historyIndex]);

  const refresh = useCallback(() => {
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-100">
        <div className="flex gap-1">
          <button 
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={goBack}
            disabled={historyIndex === 0}
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            aria-label="Go forward"
          >
            <ArrowRight size={16} />
          </button>
          <button 
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            onClick={refresh}
            aria-label="Refresh page"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <form onSubmit={handleNavigate} className="flex-1">
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-shadow"
            aria-label="URL address bar"
            placeholder="Enter URL or search"
          />
        </form>
      </div>
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10" aria-label="Loading">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe 
          ref={iframeRef}
          src={url} 
          title="Browser" 
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          aria-label={`Browser content: ${url}`}
        />
      </div>
    </div>
  );
});

Browser.displayName = 'Browser';
