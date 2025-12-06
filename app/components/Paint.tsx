'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Pencil, Square, Circle, Eraser, Download, Trash2 } from 'lucide-react';

export const Paint = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'square' | 'circle' | 'eraser'>('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getCoordinates(e);
    startPos.current = pos;
    setIsDrawing(true);
    
    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [tool, getCoordinates]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getCoordinates(e);
    
    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 2;
      ctx.lineCap = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'square') {
      // Redraw canvas to show preview
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(
        startPos.current.x,
        startPos.current.y,
        pos.x - startPos.current.x,
        pos.y - startPos.current.y
      );
    } else if (tool === 'circle') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.current.x, 2) + 
        Math.pow(pos.y - startPos.current.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.current.x, startPos.current.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [isDrawing, tool, color, lineWidth, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(false);
    
    if (tool === 'square' || tool === 'circle') {
      // Finalize shape
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  }, [isDrawing, tool]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'paint-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const tools = [
    { id: 'pencil' as const, icon: <Pencil size={18} />, label: 'Pencil' },
    { id: 'square' as const, icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'circle' as const, icon: <Circle size={18} />, label: 'Circle' },
    { id: 'eraser' as const, icon: <Eraser size={18} />, label: 'Eraser' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="h-12 border-b bg-white flex items-center gap-2 px-3">
        <div className="flex gap-1 border-r pr-2">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`p-2 rounded transition-colors ${
                tool === t.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
              title={t.label}
              aria-label={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-r pr-2">
          <label className="text-xs text-gray-600">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            aria-label="Color picker"
          />
        </div>
        <div className="flex items-center gap-2 border-r pr-2">
          <label className="text-xs text-gray-600">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
            aria-label="Line width"
          />
          <span className="text-xs text-gray-600 w-6">{lineWidth}</span>
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={clearCanvas}
            className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-xs"
            aria-label="Clear canvas"
          >
            <Trash2 size={16} /> Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-xs"
            aria-label="Download"
          >
            <Download size={16} /> Save
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white shadow-lg cursor-crosshair"
          style={{ width: '100%', maxWidth: '800px', height: '100%', maxHeight: '600px' }}
          aria-label="Drawing canvas"
        />
      </div>
    </div>
  );
});

Paint.displayName = 'Paint';

