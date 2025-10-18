'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '@/types';

interface WindowProps {
  window: WindowState;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onUpdateBounds: (bounds: { x?: number; y?: number; width?: number; height?: number }) => void;
  children: React.ReactNode;
}

const MIN_WINDOW_WIDTH = 400;
const MIN_WINDOW_HEIGHT = 300;

export default function Window({
  window,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdateBounds,
  children,
}: WindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        onUpdateBounds({
          x: window.bounds.x + dx,
          y: window.bounds.y + dy,
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        onUpdateBounds({
          width: Math.max(MIN_WINDOW_WIDTH, resizeStart.width + dx),
          height: Math.max(MIN_WINDOW_HEIGHT, resizeStart.height + dy),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, window.bounds, onUpdateBounds]);

  if (window.isMinimized) {
    return null;
  }

  const style: React.CSSProperties = window.isMaximized
    ? {
        left: 0,
        top: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex: window.zIndex,
      }
    : {
        left: `${window.bounds.x}px`,
        top: `${window.bounds.y}px`,
        width: `${window.bounds.width}px`,
        height: `${window.bounds.height}px`,
        zIndex: window.zIndex,
      };

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden transition-shadow ${
        window.isFocused ? 'ring-2 ring-blue-500' : ''
      }`}
      style={style}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          window.isFocused ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-400'
        } text-white cursor-move select-none`}
        onMouseDown={(e) => {
          if (!window.isMaximized) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
          }
          onFocus();
        }}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{window.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            title="Maximize"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
          <button
            className="w-6 h-6 rounded hover:bg-red-500 flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto bg-white">{children}</div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            setResizeStart({
              x: e.clientX,
              y: e.clientY,
              width: window.bounds.width,
              height: window.bounds.height,
            });
          }}
        >
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
