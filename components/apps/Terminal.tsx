'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '@/types';
import { vfs } from '@/lib/filesystem';

export default function Terminal({ windowId: _windowId }: AppProps) {
  const [history, setHistory] = useState<{ type: 'command' | 'output' | 'error'; text: string }[]>([
    { type: 'output', text: 'NextOS Terminal v1.0.0' },
    { type: 'output', text: 'Type "help" for available commands.' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState('/home');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Add command to history
    setHistory((prev) => [...prev, { type: 'command', text: `${currentPath}$ ${trimmed}` }]);

    const parts = trimmed.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'help':
          addOutput([
            'Available commands:',
            '  help           - Show this help message',
            '  ls             - List directory contents',
            '  cd <path>      - Change directory',
            '  pwd            - Print working directory',
            '  cat <file>     - Display file contents',
            '  clear          - Clear terminal',
            '  echo <text>    - Print text',
            '  date           - Show current date and time',
            '  whoami         - Show current user',
          ]);
          break;

        case 'ls':
          await listDirectory();
          break;

        case 'cd':
          await changeDirectory(args[0] || '/home');
          break;

        case 'pwd':
          addOutput([currentPath]);
          break;

        case 'cat':
          if (!args[0]) {
            addError('cat: missing file argument');
          } else {
            await catFile(args[0]);
          }
          break;

        case 'clear':
          setHistory([]);
          break;

        case 'echo':
          addOutput([args.join(' ')]);
          break;

        case 'date':
          addOutput([new Date().toString()]);
          break;

        case 'whoami':
          addOutput(['user']);
          break;

        default:
          addError(`Command not found: ${cmd}`);
      }
    } catch (error) {
      addError(`Error executing command: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const listDirectory = async () => {
    try {
      const node = await vfs.readNodeByPath(currentPath);
      if (!node || node.type !== 'directory') {
        addError(`ls: cannot access '${currentPath}': Not a directory`);
        return;
      }

      const children = await vfs.listChildren(node.id);
      if (children.length === 0) {
        addOutput(['']);
        return;
      }

      const output = children
        .map((child) => {
          const prefix = child.type === 'directory' ? 'd' : '-';
          const name = child.type === 'directory' ? child.name + '/' : child.name;
          return `${prefix}  ${name}`;
        })
        .join('\n');

      addOutput([output]);
    } catch (error) {
      addError(`ls: error reading directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const changeDirectory = async (path: string) => {
    try {
      let newPath: string;
      if (path.startsWith('/')) {
        newPath = path;
      } else if (path === '..') {
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        newPath = '/' + parts.join('/');
      } else {
        newPath = currentPath === '/' ? `/${path}` : `${currentPath}/${path}`;
      }

      const node = await vfs.readNodeByPath(newPath);
      if (!node) {
        addError(`cd: ${path}: No such file or directory`);
        return;
      }

      if (node.type !== 'directory') {
        addError(`cd: ${path}: Not a directory`);
        return;
      }

      setCurrentPath(newPath);
    } catch (error) {
      addError(`cd: error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const catFile = async (fileName: string) => {
    try {
      const filePath = fileName.startsWith('/') ? fileName : currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
      const node = await vfs.readNodeByPath(filePath);

      if (!node) {
        addError(`cat: ${fileName}: No such file or directory`);
        return;
      }

      if (node.type !== 'file') {
        addError(`cat: ${fileName}: Is a directory`);
        return;
      }

      if (typeof node.content === 'string') {
        addOutput([node.content]);
      } else {
        addError(`cat: ${fileName}: Cannot display binary content`);
      }
    } catch (error) {
      addError(`cat: error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addOutput = (lines: string[]) => {
    setHistory((prev) => [...prev, ...lines.map((text) => ({ type: 'output' as const, text }))]);
  };

  const addError = (text: string) => {
    setHistory((prev) => [...prev, { type: 'error' as const, text }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
  };

  return (
    <div className="h-full bg-gray-900 text-green-400 font-mono text-sm flex flex-col" onClick={() => inputRef.current?.focus()}>
      <div ref={outputRef} className="flex-1 overflow-auto p-4 space-y-1">
        {history.map((entry, index) => (
          <div
            key={index}
            className={`${entry.type === 'command' ? 'text-white' : entry.type === 'error' ? 'text-red-400' : 'text-green-400'}`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="px-4 pb-4 flex items-center gap-2">
        <span className="text-white">{currentPath}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-green-400"
          autoFocus
        />
      </form>
    </div>
  );
}
