'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { vfs } from '@/lib/filesystem';
import { FileSystemNode } from '@/types';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (path: string, fileName: string) => void;
  defaultFileName: string;
  fileExtension: string;
  appType: 'writer' | 'calc' | 'slides';
}

export default function SaveModal({
  isOpen,
  onClose,
  onSave,
  defaultFileName,
  fileExtension,
  appType,
}: SaveModalProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState(defaultFileName);
  const [currentPath, setCurrentPath] = useState('/home/documents');
  const [directories, setDirectories] = useState<FileSystemNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectories = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      await vfs.init();
      await vfs.initializeDefaultStructure();
      
      const currentNode = await vfs.readNodeByPath(path);
      if (currentNode) {
        const children = await vfs.listChildren(currentNode.id);
        const dirs = children.filter(node => node.type === 'directory');
        setDirectories(dirs);
      }
    } catch (err) {
      setError(t('saveModal.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName);
      loadDirectories(currentPath);
    }
  }, [isOpen, currentPath, defaultFileName, loadDirectories]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleGoUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/'));
    } else {
      setCurrentPath('/');
    }
  };

  const handleSave = () => {
    if (!fileName.trim()) {
      setError(t('saveModal.fileNameRequired'));
      return;
    }
    
    const finalFileName = fileName.endsWith(fileExtension) 
      ? fileName 
      : `${fileName}${fileExtension}`;
    
    onSave(currentPath, finalFileName);
    onClose();
  };

  const getAppTitle = () => {
    switch (appType) {
      case 'writer':
        return t('writer.title');
      case 'calc':
        return t('calc.title');
      case 'slides':
        return t('slides.title');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('saveModal.title', { app: getAppTitle() })}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          {/* Current Path */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleGoUp}
              disabled={currentPath === '/'}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⬆️ {t('saveModal.goUp')}
            </button>
            <div className="flex-1 px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 truncate">
              {currentPath}
            </div>
          </div>

          {/* Directory List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded mb-4 min-h-[150px]">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                {t('saveModal.loading')}
              </div>
            ) : directories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('saveModal.noFolders')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {directories.map((dir) => (
                  <button
                    key={dir.id}
                    onClick={() => handleNavigate(dir.path)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-blue-50 text-left"
                  >
                    <span className="text-xl">📁</span>
                    <span className="text-sm text-gray-700">{dir.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* File Name Input */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('saveModal.fileName')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-blue-500"
                placeholder={t('saveModal.fileNamePlaceholder')}
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600">
                {fileExtension}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 mb-2">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors"
          >
            {t('saveModal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium text-white transition-colors"
          >
            {t('saveModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
