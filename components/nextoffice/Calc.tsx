'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import { CellData, Sheet } from '@/types/nextoffice';
import OfficeToolbar, { ToolbarButton } from '@/components/nextoffice/common/OfficeToolbar';
import OfficeStatusBar from '@/components/nextoffice/common/OfficeStatusBar';

const ROWS = 20;
const COLS = 10;
const COL_LABELS = 'ABCDEFGHIJ'.split('');

export default function Calc({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [fileName] = useState(t('calc.untitled'));
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: '1', name: `${t('calc.sheets.sheet')} 1`, cells: new Map() },
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSheet = sheets[activeSheetIndex];

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getCellValue = (row: number, col: number): string => {
    const cell = activeSheet.cells.get(getCellKey(row, col));
    if (!cell) return '';
    if (cell.formula) {
      return evaluateFormula(cell.formula);
    }
    return cell.value?.toString() || '';
  };

  const evaluateFormula = (formula: string): string => {
    try {
      // Simple formula evaluation (SUM, AVERAGE, etc.)
      if (formula.startsWith('=SUM(')) {
        const range = formula.slice(5, -1);
        const values = parseRange(range);
        return values.reduce((a, b) => a + b, 0).toString();
      }
      if (formula.startsWith('=AVERAGE(')) {
        const range = formula.slice(9, -1);
        const values = parseRange(range);
        return (values.reduce((a, b) => a + b, 0) / values.length).toString();
      }
      if (formula.startsWith('=COUNT(')) {
        const range = formula.slice(7, -1);
        const values = parseRange(range);
        return values.length.toString();
      }
      if (formula.startsWith('=MAX(')) {
        const range = formula.slice(5, -1);
        const values = parseRange(range);
        return Math.max(...values).toString();
      }
      if (formula.startsWith('=MIN(')) {
        const range = formula.slice(5, -1);
        const values = parseRange(range);
        return Math.min(...values).toString();
      }
      // Simple arithmetic
      if (formula.startsWith('=')) {
        const expr = formula.slice(1);
        // eslint-disable-next-line no-eval
        return eval(expr).toString();
      }
      return formula;
    } catch {
      return '#ERROR';
    }
  };

  const parseRange = (range: string): number[] => {
    // Simple range parser (e.g., A1:A5)
    const values: number[] = [];
    if (range.includes(':')) {
      const [start, end] = range.split(':');
      const startCol = start.charCodeAt(0) - 65;
      const startRow = parseInt(start.slice(1)) - 1;
      const endCol = end.charCodeAt(0) - 65;
      const endRow = parseInt(end.slice(1)) - 1;

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cell = activeSheet.cells.get(getCellKey(row, col));
          const value = parseFloat(cell?.value?.toString() || '0');
          if (!isNaN(value)) values.push(value);
        }
      }
    }
    return values;
  };

  const setCellValue = (row: number, col: number, value: string) => {
    const newSheets = [...sheets];
    const cellData: CellData = {
      value: value.startsWith('=') ? value : value,
      formula: value.startsWith('=') ? value : undefined,
    };
    newSheets[activeSheetIndex].cells.set(getCellKey(row, col), cellData);
    setSheets(newSheets);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCellEdit = (value: string) => {
    if (editingCell) {
      setCellValue(editingCell.row, editingCell.col, value);
    }
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const addSheet = () => {
    const newSheet: Sheet = {
      id: (sheets.length + 1).toString(),
      name: `${t('calc.sheets.sheet')} ${sheets.length + 1}`,
      cells: new Map(),
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  const toolbarButtons: ToolbarButton[] = [
    { id: 'save', icon: '💾', label: t('calc.toolbar.save'), onClick: () => console.log('Save') },
    { id: 'export', icon: '📤', label: t('calc.toolbar.export'), onClick: () => alert(t('calc.export.title')) },
    { id: 'sep1', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'bold', icon: '𝐁', label: t('calc.toolbar.bold'), onClick: () => console.log('Bold') },
    { id: 'italic', icon: '𝐼', label: t('calc.toolbar.italic'), onClick: () => console.log('Italic') },
    { id: 'sep2', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'chart', icon: '📊', label: t('calc.toolbar.addChart'), onClick: () => alert(t('calc.toolbar.addChart')) },
    { id: 'function', icon: 'ƒ', label: t('calc.toolbar.function'), onClick: () => alert(t('calc.toolbar.function')) },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <OfficeToolbar buttons={toolbarButtons}>
        <div className="flex-1" />
        <div className="text-sm text-gray-600">{fileName}</div>
      </OfficeToolbar>

      {/* Formula Bar */}
      <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center gap-2">
        <div className="text-sm font-medium text-gray-700 min-w-[60px]">
          {selectedCell ? `${COL_LABELS[selectedCell.col]}${selectedCell.row + 1}` : ''}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
          value={editingCell ? activeSheet.cells.get(getCellKey(editingCell.row, editingCell.col))?.value || '' : ''}
          onChange={(e) => handleCellEdit(e.target.value)}
          onBlur={handleCellBlur}
          placeholder={t('calc.toolbar.function')}
        />
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 bg-gray-200 border border-gray-300 w-12 h-8 text-xs font-medium text-gray-600"></th>
              {COL_LABELS.map((label, col) => (
                <th
                  key={col}
                  className="sticky top-0 z-10 bg-gray-200 border border-gray-300 min-w-[100px] h-8 text-xs font-medium text-gray-600"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, row) => (
              <tr key={row}>
                <td className="sticky left-0 z-10 bg-gray-200 border border-gray-300 text-center text-xs font-medium text-gray-600 w-12 h-8">
                  {row + 1}
                </td>
                {Array.from({ length: COLS }).map((_, col) => (
                  <td
                    key={col}
                    className={`border border-gray-300 px-2 py-1 text-sm cursor-cell ${
                      selectedCell?.row === row && selectedCell?.col === col ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleCellClick(row, col)}
                  >
                    {getCellValue(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-gray-100 border-t border-gray-300 px-2 py-1 flex items-center gap-1">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            className={`px-3 py-1 rounded-t text-sm transition-colors ${
              activeSheetIndex === index ? 'bg-white text-gray-900 font-medium' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            onClick={() => setActiveSheetIndex(index)}
          >
            {sheet.name}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded text-sm bg-green-500 text-white hover:bg-green-600 transition-colors ml-2"
          onClick={addSheet}
        >
          + {t('calc.sheets.new')}
        </button>
      </div>

      {/* Status Bar */}
      <OfficeStatusBar
        items={[
          { id: 'cell', label: t('calc.statusBar.cell'), value: selectedCell ? `${COL_LABELS[selectedCell.col]}${selectedCell.row + 1}` : '-' },
          { id: 'sum', label: t('calc.statusBar.sum'), value: '0' },
        ]}
      />
    </div>
  );
}
