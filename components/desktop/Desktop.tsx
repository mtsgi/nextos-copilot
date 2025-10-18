'use client';

import React, { useState, useEffect } from 'react';
import { windowManager } from '@/lib/window-manager';
import { processManager } from '@/lib/process';
import { vfs } from '@/lib/filesystem';
import Window from '@/components/window/Window';
import FileManager from '@/components/apps/FileManager';
import Terminal from '@/components/apps/Terminal';
import TextEditor from '@/components/apps/TextEditor';
import type { WindowState, Application } from '@/types';

const applications: Application[] = [
  {
    id: 'file-manager',
    name: 'Files',
    icon: '📁',
    component: FileManager,
    category: 'system',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '⌘',
    component: Terminal,
    category: 'system',
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    icon: '📝',
    component: TextEditor,
    category: 'productivity',
  },
];

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize filesystem on mount
    const initializeSystem = async () => {
      try {
        await vfs.init();
        await vfs.initializeDefaultStructure();
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize filesystem:', error);
      }
    };

    initializeSystem();

    // Subscribe to window manager updates
    const unsubscribe = windowManager.subscribe(() => {
      setWindows(windowManager.getAllWindows());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const launchApp = (app: Application) => {
    const windowId = windowManager.createWindow(app.id, app.name);
    processManager.createProcess(app.name, app.id, windowId);
  };

  const handleCloseWindow = (windowId: string) => {
    const process = processManager.getProcessByWindowId(windowId);
    if (process) {
      processManager.terminateProcess(process.id);
    }
    windowManager.closeWindow(windowId);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
      {/* Desktop Icons */}
      <div className="flex-1 p-8 grid grid-cols-auto-fit gap-6 content-start">
        {applications.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-colors group"
            onDoubleClick={() => launchApp(app)}
          >
            <div className="text-6xl">{app.icon}</div>
            <span className="text-white text-sm font-medium drop-shadow-lg">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Windows */}
      {initialized &&
        windows.map((window) => {
          const app = applications.find((a) => a.id === window.appId);
          if (!app) return null;

          const AppComponent = app.component;

          return (
            <Window
              key={window.id}
              window={window}
              onFocus={() => windowManager.focusWindow(window.id)}
              onClose={() => handleCloseWindow(window.id)}
              onMinimize={() => windowManager.minimizeWindow(window.id)}
              onMaximize={() => windowManager.maximizeWindow(window.id)}
              onUpdateBounds={(bounds) => windowManager.updateWindowBounds(window.id, bounds)}
            >
              <AppComponent windowId={window.id} onClose={() => handleCloseWindow(window.id)} />
            </Window>
          );
        })}

      {/* Taskbar */}
      <div className="h-12 bg-gray-900/80 backdrop-blur-sm border-t border-white/10 flex items-center px-4 gap-2">
        {/* App Launcher */}
        <div className="flex gap-2">
          {applications.map((app) => (
            <button
              key={app.id}
              className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-2xl"
              onClick={() => launchApp(app)}
              title={app.name}
            >
              {app.icon}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Window List */}
        <div className="flex gap-1">
          {windows
            .filter((w) => !w.isMinimized)
            .map((window) => {
              const app = applications.find((a) => a.id === window.appId);
              return (
                <button
                  key={window.id}
                  className={`px-4 py-1 rounded text-sm transition-colors ${
                    window.isFocused ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                  onClick={() => windowManager.focusWindow(window.id)}
                >
                  {app?.icon} {window.title}
                </button>
              );
            })}
        </div>

        <div className="flex-1" />

        {/* System Tray */}
        <div className="flex items-center gap-2 text-white text-sm">
          <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    </div>
  );
}
