'use client';

import React from 'react';

interface OfficeStatusBarProps {
  items?: { id: string; label: string; value: string }[];
  children?: React.ReactNode;
}

export default function OfficeStatusBar({ items = [], children }: OfficeStatusBarProps) {
  return (
    <div className="bg-gray-100 border-t border-gray-300 px-2 sm:px-3 py-1 flex items-center justify-between text-[10px] sm:text-xs text-gray-600 min-h-[24px] sm:min-h-[28px] overflow-x-auto">
      <div className="flex items-center gap-2 sm:gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
            <span className="font-medium">{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
      {children && <div className="flex items-center gap-1 sm:gap-2">{children}</div>}
    </div>
  );
}
