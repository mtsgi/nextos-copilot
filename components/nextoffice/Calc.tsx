'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import { CellData, Sheet } from '@/types/nextoffice';
import { vfs } from '@/lib/filesystem';
import OfficeToolbar, { ToolbarButton } from '@/components/nextoffice/common/OfficeToolbar';
import OfficeStatusBar from '@/components/nextoffice/common/OfficeStatusBar';
import SaveModal from '@/components/nextoffice/common/SaveModal';

const ROWS = 20;
const COLS = 10;
const COL_LABELS = 'ABCDEFGHIJ'.split('');

// Available functions for insertion
const AVAILABLE_FUNCTIONS = [
  { name: 'SUM', syntax: '=SUM(A1:A10)', description: 'Adds all numbers in a range' },
  { name: 'AVERAGE', syntax: '=AVERAGE(A1:A10)', description: 'Calculates the average of numbers' },
  { name: 'COUNT', syntax: '=COUNT(A1:A10)', description: 'Counts cells with numbers' },
  { name: 'MAX', syntax: '=MAX(A1:A10)', description: 'Returns the largest value' },
  { name: 'MIN', syntax: '=MIN(A1:A10)', description: 'Returns the smallest value' },
  { name: 'IF', syntax: '=IF(A1>10,"Yes","No")', description: 'Conditional logic' },
];

export default function Calc({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState(t('calc.untitled'));
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: '1', name: `${t('calc.sheets.sheet')} 1`, cells: new Map() },
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [showFunctionPicker, setShowFunctionPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
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

  const insertFunction = (func: typeof AVAILABLE_FUNCTIONS[0]) => {
    if (selectedCell) {
      setCellValue(selectedCell.row, selectedCell.col, func.syntax);
      setEditingCell(selectedCell);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    setShowFunctionPicker(false);
  };

  const handleSaveToFilesystem = async (path: string, name: string) => {
    try {
      await vfs.init();
      
      // Convert sheets data to JSON for storage
      const sheetsData = sheets.map(sheet => ({
        id: sheet.id,
        name: sheet.name,
        cells: Object.fromEntries(sheet.cells),
      }));
      
      const content = JSON.stringify({ sheets: sheetsData }, null, 2);
      const parentNode = await vfs.readNodeByPath(path);
      const filePath = `${path}/${name}`;
      
      // Check if file exists
      const existingFile = await vfs.readNodeByPath(filePath);
      
      if (existingFile) {
        existingFile.content = content;
        existingFile.modifiedAt = new Date();
        existingFile.size = new Blob([content]).size;
        await vfs.updateNode(existingFile);
      } else {
        await vfs.createFile(filePath, content, parentNode?.id || null);
      }
      
      setFileName(name);
      alert(t('saveModal.savedSuccess'));
    } catch (error) {
      console.error('Failed to save file:', error);
      alert(t('saveModal.savedError'));
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    { id: 'save', icon: '💾', label: t('calc.toolbar.save'), onClick: () => setShowSaveModal(true) },
    { id: 'export', icon: '📤', label: t('calc.toolbar.export'), onClick: () => alert(t('calc.export.title')) },
    { id: 'sep1', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'bold', icon: '𝐁', label: t('calc.toolbar.bold'), onClick: () => console.log('Bold') },
    { id: 'italic', icon: '𝐼', label: t('calc.toolbar.italic'), onClick: () => console.log('Italic') },
    { id: 'sep2', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'chart', icon: '📊', label: t('calc.toolbar.addChart'), onClick: () => alert(t('calc.toolbar.addChart')) },
    { id: 'function', icon: 'ƒ', label: t('calc.toolbar.function'), onClick: () => setShowFunctionPicker(true) },
  ];

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Toolbar - Compact on mobile */}
      <OfficeToolbar buttons={toolbarButtons}>
        <div className="flex-1" />
        <div className="text-sm text-gray-600 hidden sm:block">{fileName}</div>
      </OfficeToolbar>

      {/* Formula Bar - Stacked on mobile */}
      <div className="bg-gray-50 border-b border-gray-300 px-2 sm:px-3 py-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="text-sm font-medium text-gray-700 min-w-[60px] text-center sm:text-left">
          {selectedCell ? `${COL_LABELS[selectedCell.col]}${selectedCell.row + 1}` : '-'}
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

      {/* Spreadsheet Grid - Full width scrollable on mobile */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse min-w-full">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-20 bg-gray-200 border border-gray-300 w-8 sm:w-12 h-8 text-xs font-medium text-gray-600"></th>
              {COL_LABELS.map((label, col) => (
                <th
                  key={col}
                  className="sticky top-0 z-10 bg-gray-200 border border-gray-300 min-w-[70px] sm:min-w-[100px] h-8 text-xs font-medium text-gray-600"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, row) => (
              <tr key={row}>
                <td className="sticky left-0 z-10 bg-gray-200 border border-gray-300 text-center text-xs font-medium text-gray-600 w-8 sm:w-12 h-8">
                  {row + 1}
                </td>
                {Array.from({ length: COLS }).map((_, col) => (
                  <td
                    key={col}
                    className={`border border-gray-300 px-1 sm:px-2 py-1 text-xs sm:text-sm cursor-cell min-w-[70px] sm:min-w-[100px] ${
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

      {/* Sheet Tabs - Scrollable on mobile */}
      <div className="bg-gray-100 border-t border-gray-300 px-2 py-1 flex items-center gap-1 overflow-x-auto">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            className={`px-2 sm:px-3 py-1 rounded-t text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeSheetIndex === index ? 'bg-white text-gray-900 font-medium' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            onClick={() => setActiveSheetIndex(index)}
          >
            {sheet.name}
          </button>
        ))}
        <button
          className="px-2 py-1 rounded text-xs sm:text-sm bg-green-500 text-white hover:bg-green-600 transition-colors ml-2 whitespace-nowrap"
          onClick={addSheet}
        >
          + {t('calc.sheets.new')}
        </button>
      </div>

      {/* Status Bar - Compact on mobile */}
      <OfficeStatusBar
        items={[
          { id: 'cell', label: t('calc.statusBar.cell'), value: selectedCell ? `${COL_LABELS[selectedCell.col]}${selectedCell.row + 1}` : '-' },
          { id: 'sum', label: t('calc.statusBar.sum'), value: '0' },
        ]}
      />

      {/* Function Picker Modal */}
      {showFunctionPicker && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{t('calc.toolbar.function')}</h3>
              <button
                onClick={() => setShowFunctionPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {AVAILABLE_FUNCTIONS.map((func) => (
                <button
                  key={func.name}
                  onClick={() => insertFunction(func)}
                  className="w-full p-3 text-left hover:bg-blue-50 rounded-lg transition-colors mb-1"
                >
                  <div className="font-medium text-blue-600">{func.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{func.syntax}</div>
                  <div className="text-xs text-gray-600 mt-1">{func.description}</div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-200 text-xs text-gray-500 text-center">
              {selectedCell 
                ? `Insert into ${COL_LABELS[selectedCell.col]}${selectedCell.row + 1}`
                : 'Select a cell first'
              }
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveToFilesystem}
        defaultFileName={fileName.endsWith('.json') ? fileName.replace('.json', '') : fileName}
        fileExtension=".json"
        appType="calc"
      />
    </div>
  );
}
