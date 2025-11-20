'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { windowManager } from '@/lib/window-manager';
import { processManager } from '@/lib/process';
import { vfs } from '@/lib/filesystem';
import Window from '@/components/window/Window';
import FileManager from '@/components/apps/FileManager';
import Terminal from '@/components/apps/Terminal';
import TextEditor from '@/components/apps/TextEditor';
import Settings from '@/components/apps/Settings';
import ControlCenter from '@/components/apps/ControlCenter';
import type { WindowState, Application } from '@/types';

const applications: Application[] = [
  {
    id: 'file-manager',
    name: 'apps.files',
    icon: '📁',
    component: FileManager,
    category: 'system',
  },
  {
    id: 'terminal',
    name: 'apps.terminal',
    icon: '⌘',
    component: Terminal,
    category: 'system',
  },
  {
    id: 'text-editor',
    name: 'apps.textEditor',
    icon: '📝',
    component: TextEditor,
    category: 'productivity',
  },
  {
    id: 'settings',
    name: 'apps.settings',
    icon: '⚙️',
    component: Settings,
    category: 'system',
  },
  {
    id: 'control-center',
    name: 'apps.controlCenter',
    icon: '🎛️',
    component: ControlCenter,
    category: 'system',
  },
];

export default function Desktop() {
  const { t } = useTranslation();
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileAppDrawer, setShowMobileAppDrawer] = useState(false);

  useEffect(() => {
    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const windowId = windowManager.createWindow(app.id, t(app.name));
    processManager.createProcess(t(app.name), app.id, windowId);
    
    // On mobile, close the app drawer and maximize the window
    if (isMobile) {
      setShowMobileAppDrawer(false);
      windowManager.maximizeWindow(windowId);
    }
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
      {/* Desktop Icons - Hidden on mobile */}
      {!isMobile && (
        <div className="flex-1 p-8 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-6 content-start">
          {applications.map((app) => (
            <button
              key={app.id}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-colors group"
              onDoubleClick={() => launchApp(app)}
            >
              <div className="text-6xl">{app.icon}</div>
              <span className="text-white text-sm font-medium drop-shadow-lg">{t(app.name)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile Home Screen */}
      {isMobile && windows.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{t('desktop.title')}</h1>
            <p className="text-white/70 text-sm">{t('desktop.mobileEdition')}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full max-w-md">
            {applications.map((app) => (
              <button
                key={app.id}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm active:scale-95 transition-transform"
                onClick={() => launchApp(app)}
              >
                <div className="text-5xl">{app.icon}</div>
                <span className="text-white text-xs font-medium text-center">{t(app.name)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
              isMobile={isMobile}
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

      {/* Desktop Taskbar - Hidden on mobile when app is open */}
      {(!isMobile || windows.length === 0) && (
        <div className="h-12 md:h-12 bg-gray-900/80 backdrop-blur-sm border-t border-white/10 flex items-center px-4 gap-2">
          {/* App Launcher - Desktop */}
          {!isMobile && (
            <div className="flex gap-2">
              {applications.map((app) => (
                <button
                  key={app.id}
                  className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-2xl"
                  onClick={() => launchApp(app)}
                  title={t(app.name)}
                >
                  {app.icon}
                </button>
              ))}
            </div>
          )}

          {/* Mobile App Drawer Button */}
          {isMobile && (
            <button
              className="w-10 h-10 flex items-center justify-center rounded bg-white/10 text-white text-2xl"
              onClick={() => setShowMobileAppDrawer(!showMobileAppDrawer)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex-1" />

          {/* Window List - Desktop only */}
          {!isMobile && (
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
          )}

          {!isMobile && <div className="flex-1" />}

          {/* System Tray */}
          <div className="flex items-center gap-2 text-white text-sm">
            <div>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      )}

      {/* Mobile App Drawer */}
      {isMobile && showMobileAppDrawer && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowMobileAppDrawer(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg rounded-t-3xl p-6 pb-safe animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
            <h2 className="text-white text-xl font-semibold mb-4">{t('desktop.apps')}</h2>
            <div className="grid grid-cols-4 gap-4">
              {applications.map((app) => (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl active:bg-white/10 transition-colors"
                  onClick={() => launchApp(app)}
                >
                  <div className="text-4xl">{app.icon}</div>
                  <span className="text-white text-xs text-center">{t(app.name)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
