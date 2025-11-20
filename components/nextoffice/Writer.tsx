'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import OfficeToolbar, { ToolbarButton, ToolbarDropdown } from '@/components/nextoffice/common/OfficeToolbar';
import OfficeStatusBar from '@/components/nextoffice/common/OfficeStatusBar';

interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  alignment: 'left' | 'center' | 'right' | 'justify';
  fontSize: string;
  fontFamily: string;
}

export default function Writer({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState(t('writer.untitled'));
  const [isSaved, setIsSaved] = useState(true);
  const [format, setFormat] = useState<TextFormat>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left',
    fontSize: '14px',
    fontFamily: 'Arial',
  });

  const handleFormat = (formatType: keyof TextFormat) => {
    if (formatType === 'bold' || formatType === 'italic' || formatType === 'underline' || formatType === 'strikethrough') {
      setFormat((prev) => ({ ...prev, [formatType]: !prev[formatType] }));
      document.execCommand(formatType, false);
    }
    setIsSaved(false);
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    setFormat((prev) => ({ ...prev, alignment }));
    const command = alignment === 'left' ? 'justifyLeft' : alignment === 'center' ? 'justifyCenter' : alignment === 'right' ? 'justifyRight' : 'justifyFull';
    document.execCommand(command, false);
    setIsSaved(false);
  };

  const handleFontSize = (size: string) => {
    setFormat((prev) => ({ ...prev, fontSize: size }));
    document.execCommand('fontSize', false, '7');
    if (editorRef.current) {
      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
      fontElements.forEach((el) => {
        (el as HTMLElement).removeAttribute('size');
        (el as HTMLElement).style.fontSize = size;
      });
    }
    setIsSaved(false);
  };

  const handleFontFamily = (font: string) => {
    setFormat((prev) => ({ ...prev, fontFamily: font }));
    document.execCommand('fontName', false, font);
    setIsSaved(false);
  };

  const handleNew = () => {
    if (!isSaved && !confirm(t('textEditor.unsavedChanges'))) {
      return;
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setFileName(t('writer.untitled'));
    setIsSaved(true);
  };

  const handleSave = () => {
    setIsSaved(true);
    console.log('Document saved:', fileName);
  };

  const handleExport = (format: 'pdf' | 'docx' | 'txt') => {
    console.log('Export as:', format);
    // In a real implementation, this would generate the file
    alert(`${t('writer.export.title')}: ${format.toUpperCase()}`);
  };

  const toolbarButtons: ToolbarButton[] = [
    { id: 'new', icon: '📄', label: t('writer.toolbar.new'), onClick: handleNew },
    { id: 'save', icon: '💾', label: t('writer.toolbar.save'), onClick: handleSave },
    { id: 'sep1', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'bold', icon: '𝐁', label: t('writer.toolbar.bold'), onClick: () => handleFormat('bold'), active: format.bold },
    { id: 'italic', icon: '𝐼', label: t('writer.toolbar.italic'), onClick: () => handleFormat('italic'), active: format.italic },
    { id: 'underline', icon: 'U̲', label: t('writer.toolbar.underline'), onClick: () => handleFormat('underline'), active: format.underline },
    { id: 'strikethrough', icon: 'S̶', label: t('writer.toolbar.strikethrough'), onClick: () => handleFormat('strikethrough'), active: format.strikethrough },
    { id: 'sep2', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'alignLeft', icon: '≡', label: t('writer.toolbar.alignLeft'), onClick: () => handleAlignment('left'), active: format.alignment === 'left' },
    { id: 'alignCenter', icon: '≣', label: t('writer.toolbar.alignCenter'), onClick: () => handleAlignment('center'), active: format.alignment === 'center' },
    { id: 'alignRight', icon: '≡', label: t('writer.toolbar.alignRight'), onClick: () => handleAlignment('right'), active: format.alignment === 'right' },
    { id: 'alignJustify', icon: '≣', label: t('writer.toolbar.alignJustify'), onClick: () => handleAlignment('justify'), active: format.alignment === 'justify' },
  ];

  const toolbarDropdowns: ToolbarDropdown[] = [
    {
      id: 'fontFamily',
      label: t('writer.toolbar.font'),
      value: format.fontFamily,
      onChange: handleFontFamily,
      options: [
        { value: 'Arial', label: 'Arial' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Courier New', label: 'Courier New' },
        { value: 'Georgia', label: 'Georgia' },
        { value: 'Verdana', label: 'Verdana' },
      ],
    },
    {
      id: 'fontSize',
      label: t('writer.toolbar.fontSize'),
      value: format.fontSize,
      onChange: handleFontSize,
      options: [
        { value: '12px', label: '12' },
        { value: '14px', label: '14' },
        { value: '16px', label: '16' },
        { value: '18px', label: '18' },
        { value: '20px', label: '20' },
        { value: '24px', label: '24' },
        { value: '28px', label: '28' },
        { value: '32px', label: '32' },
      ],
    },
  ];

  const getContent = () => {
    return editorRef.current?.innerHTML || '';
  };

  const getWordCount = () => {
    const text = editorRef.current?.innerText || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharacterCount = () => {
    return editorRef.current?.innerText.length || 0;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <OfficeToolbar buttons={toolbarButtons} dropdowns={toolbarDropdowns}>
        <div className="flex-1" />
        <button
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
          onClick={() => {
            const exportMenu = document.createElement('select');
            exportMenu.innerHTML = `
              <option value="">${t('writer.toolbar.export')}</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
            `;
            exportMenu.onchange = (e) => {
              const format = (e.target as HTMLSelectElement).value as 'pdf' | 'docx' | 'txt';
              if (format) handleExport(format);
            };
            exportMenu.click();
          }}
        >
          📤 {t('writer.toolbar.export')}
        </button>
        <div className="text-sm text-gray-600 ml-2">
          {fileName}
          {!isSaved && ' ' + t('writer.modified')}
        </div>
      </OfficeToolbar>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8 md:p-12">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[500px] outline-none focus:outline-none bg-white"
            style={{
              fontFamily: format.fontFamily,
              fontSize: format.fontSize,
              lineHeight: '1.6',
            }}
            onInput={() => setIsSaved(false)}
            suppressContentEditableWarning
          >
            <p>{t('writer.placeholder')}</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <OfficeStatusBar
        items={[
          { id: 'words', label: t('writer.statusBar.words'), value: getWordCount().toString() },
          { id: 'characters', label: t('writer.statusBar.characters'), value: getCharacterCount().toString() },
          { id: 'pages', label: t('writer.statusBar.pages'), value: '1' },
        ]}
      />
    </div>
  );
}
