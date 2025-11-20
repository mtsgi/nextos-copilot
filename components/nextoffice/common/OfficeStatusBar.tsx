'use client';

import React from 'react';

interface OfficeStatusBarProps {
  items?: { id: string; label: string; value: string }[];
  children?: React.ReactNode;
}

export default function OfficeStatusBar({ items = [], children }: OfficeStatusBarProps) {
  return (
    <div className="bg-gray-100 border-t border-gray-300 px-3 py-1 flex items-center justify-between text-xs text-gray-600 min-h-[28px]">
      <div className="flex items-center gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-1">
            <span className="font-medium">{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
