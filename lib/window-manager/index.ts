import { WindowState, Bounds } from '@/types';

export class WindowManager {
  private windows: Map<string, WindowState> = new Map();
  private listeners: Set<() => void> = new Set();
  private nextZIndex = 1000;

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  createWindow(appId: string, title: string, bounds?: Partial<Bounds>): string {
    const id = crypto.randomUUID();
    const defaultBounds: Bounds = {
      x: 100 + (this.windows.size * 30),
      y: 100 + (this.windows.size * 30),
      width: 800,
      height: 600,
      ...bounds,
    };

    const window: WindowState = {
      id,
      title,
      appId,
      bounds: defaultBounds,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: this.nextZIndex++,
    };

    // Unfocus all other windows
    this.windows.forEach(w => {
      w.isFocused = false;
    });

    this.windows.set(id, window);
    this.notify();
    return id;
  }

  getWindow(id: string): WindowState | undefined {
    return this.windows.get(id);
  }

  getAllWindows(): WindowState[] {
    return Array.from(this.windows.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  focusWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    // Unfocus all windows
    this.windows.forEach(w => {
      w.isFocused = false;
    });

    // Focus and bring to front
    window.isFocused = true;
    window.zIndex = this.nextZIndex++;
    this.notify();
  }

  minimizeWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    window.isMinimized = true;
    window.isFocused = false;
    this.notify();
  }

  restoreWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    window.isMinimized = false;
    this.focusWindow(id);
  }

  maximizeWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    if (!window.isMaximized) {
      window.isMaximized = true;
      this.notify();
    } else {
      window.isMaximized = false;
      this.notify();
    }
  }

  updateWindowBounds(id: string, bounds: Partial<Bounds>): void {
    const window = this.windows.get(id);
    if (!window || window.isMaximized) return;

    window.bounds = { ...window.bounds, ...bounds };
    this.notify();
  }

  updateWindowTitle(id: string, title: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    window.title = title;
    this.notify();
  }

  closeWindow(id: string): void {
    this.windows.delete(id);
    
    // Focus the top window if any remain
    const windows = this.getAllWindows();
    if (windows.length > 0) {
      const topWindow = windows[windows.length - 1];
      topWindow.isFocused = true;
    }
    
    this.notify();
  }
}

export const windowManager = new WindowManager();
