'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Command {
  input: string;
  output: string;
  timestamp: Date;
}

export const Terminal = React.memo(() => {
  const [commands, setCommands] = useState<Command[]>([
    { input: '', output: 'Welcome to Terminal\nType "help" for available commands.', timestamp: new Date() }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [commands]);

  const executeCommand = useCallback((input: string) => {
    const cmd = input.trim().toLowerCase();
    let output = '';

    if (cmd === 'help') {
      output = `Available commands:
  help          - Show this help message
  clear         - Clear the terminal
  echo <text>   - Echo text
  date          - Show current date and time
  whoami        - Show current user
  ls            - List files (simulated)
  pwd           - Print working directory
  calc <expr>   - Calculate expression (e.g., calc 2+2)
  color <name>  - Change text color (red, green, blue, yellow, reset)`;
    } else if (cmd === 'clear') {
      setCommands([{ input: '', output: 'Terminal cleared.', timestamp: new Date() }]);
      return;
    } else if (cmd.startsWith('echo ')) {
      output = input.substring(5);
    } else if (cmd === 'date') {
      output = new Date().toLocaleString();
    } else if (cmd === 'whoami') {
      output = 'admin';
    } else if (cmd === 'ls') {
      output = 'Desktop  Documents  Downloads  Recycle Bin';
    } else if (cmd === 'pwd') {
      output = '/home/admin';
    } else if (cmd.startsWith('calc ')) {
      try {
        const expr = input.substring(5);
        // Safe evaluation
        const result = Function(`"use strict"; return (${expr})`)();
        output = `${expr} = ${result}`;
      } catch (e) {
        output = 'Error: Invalid expression';
      }
    } else if (cmd.startsWith('color ')) {
      const color = input.substring(6).toLowerCase();
      const validColors = ['red', 'green', 'blue', 'yellow', 'reset'];
      if (validColors.includes(color)) {
        output = `Color changed to ${color}`;
        // Could implement color change here
      } else {
        output = 'Invalid color. Use: red, green, blue, yellow, reset';
      }
    } else if (cmd === '') {
      output = '';
    } else {
      output = `Command not found: ${input}\nType "help" for available commands.`;
    }

    setCommands(prev => [...prev, { input, output, timestamp: new Date() }]);
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim()) {
      executeCommand(currentInput);
      setCurrentInput('');
    }
  }, [currentInput, executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  }, [commandHistory, historyIndex]);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400 font-mono text-sm">
      <div className="flex-1 overflow-auto p-4 space-y-1" ref={terminalRef}>
        {commands.map((cmd, index) => (
          <div key={index} className="mb-2">
            {cmd.input && (
              <div className="mb-1">
                <span className="text-blue-400">admin@paladium:~$</span>{' '}
                <span>{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <div className="text-green-400 whitespace-pre-wrap">{cmd.output}</div>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-blue-400">admin@paladium:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none ml-2 text-green-400"
            autoFocus
            aria-label="Command input"
          />
        </form>
      </div>
    </div>
  );
});

Terminal.displayName = 'Terminal';

