// Core type definitions for NextOS

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export interface WindowState {
  id: string;
  title: string;
  appId: string;
  bounds: Bounds;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
}

export interface Process {
  id: string;
  name: string;
  appId: string;
  windowId?: string;
  status: 'running' | 'suspended' | 'terminated';
  createdAt: Date;
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  parentId: string | null;
  content?: string | ArrayBuffer;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface Application {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<AppProps>;
  category: 'system' | 'utility' | 'productivity';
}

export interface AppProps {
  windowId: string;
  onClose: () => void;
}

export interface ContextMenuOption {
  label: string;
  onClick: () => void;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

export interface ContextMenu {
  x: number;
  y: number;
  options: ContextMenuOption[];
}
