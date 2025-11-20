'use client';

import React from 'react';

export interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  separator?: boolean;
}

export interface ToolbarDropdown {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface OfficeToolbarProps {
  buttons?: ToolbarButton[];
  dropdowns?: ToolbarDropdown[];
  title?: string;
  children?: React.ReactNode;
}

export default function OfficeToolbar({ buttons = [], dropdowns = [], title, children }: OfficeToolbarProps) {
  return (
    <div className="bg-gray-100 border-b border-gray-300 px-2 py-1 flex items-center gap-1 flex-wrap min-h-[40px]">
      {title && <div className="text-sm font-medium text-gray-700 mr-2">{title}</div>}
      
      {buttons.map((button) => (
        button.separator ? (
          <div key={button.id} className="w-px h-6 bg-gray-300 mx-1" />
        ) : (
          <button
            key={button.id}
            onClick={button.onClick}
            disabled={button.disabled}
            title={button.label}
            className={`px-2 py-1 rounded text-sm transition-colors ${
              button.active
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
            } ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
          >
            {button.icon}
          </button>
        )
      ))}
      
      {dropdowns.map((dropdown) => (
        <select
          key={dropdown.id}
          value={dropdown.value}
          onChange={(e) => dropdown.onChange(e.target.value)}
          disabled={dropdown.disabled}
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {dropdown.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      
      {children && <div className="flex-1 flex items-center gap-1">{children}</div>}
    </div>
  );
}
