'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';

export default function TextEditor({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState(t('textEditor.untitled'));
  const [isSaved, setIsSaved] = useState(true);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    // In a real implementation, this would save to the virtual filesystem
    setIsSaved(true);
    console.log('File saved:', fileName, content);
  };

  const handleNew = () => {
    if (!isSaved && !confirm(t('textEditor.unsavedChanges'))) {
      return;
    }
    setContent('');
    setFileName(t('textEditor.untitled'));
    setIsSaved(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center gap-2">
        <button
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
          onClick={handleNew}
        >
          {t('textEditor.toolbar.new')}
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          onClick={handleSave}
        >
          {t('textEditor.toolbar.save')}
        </button>
        <div className="flex-1" />
        <div className="text-sm text-gray-600">
          {fileName}
          {!isSaved && ' ' + t('textEditor.modified')}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none outline-none"
          placeholder={t('textEditor.placeholder')}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
        <div>{t('textEditor.statusBar.lines', { count: content.split('\n').length })}</div>
        <div>{t('textEditor.statusBar.characters', { count: content.length })}</div>
      </div>
    </div>
  );
}
