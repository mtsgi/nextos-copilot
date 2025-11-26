'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { vfs } from '@/lib/filesystem';
import { FileSystemNode } from '@/types';

interface OpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (filePath: string, content: string) => void;
  fileExtensions: string[];
  appType: 'writer' | 'calc' | 'slides';
}

export default function OpenModal({
  isOpen,
  onClose,
  onOpen,
  fileExtensions,
  appType,
}: OpenModalProps) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState('/home/documents');
  const [items, setItems] = useState<FileSystemNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    setSelectedFile(null);
    try {
      await vfs.init();
      await vfs.initializeDefaultStructure();
      
      const currentNode = await vfs.readNodeByPath(path);
      if (currentNode) {
        const children = await vfs.listChildren(currentNode.id);
        // Filter to show directories and files matching the extensions
        const filteredItems = children.filter(node => {
          if (node.type === 'directory') return true;
          // Check if file extension matches
          return fileExtensions.some(ext => node.name.endsWith(ext));
        });
        // Sort: directories first, then files
        filteredItems.sort((a, b) => {
          if (a.type === 'directory' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        });
        setItems(filteredItems);
      }
    } catch (err) {
      setError(t('openModal.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t, fileExtensions]);

  useEffect(() => {
    if (isOpen) {
      loadItems(currentPath);
    }
  }, [isOpen, currentPath, loadItems]);

  const handleNavigate = (item: FileSystemNode) => {
    if (item.type === 'directory') {
      setCurrentPath(item.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(item);
    }
  };

  const handleGoUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/'));
    } else {
      setCurrentPath('/');
    }
    setSelectedFile(null);
  };

  const handleOpen = async () => {
    if (!selectedFile) {
      setError(t('openModal.selectFileRequired'));
      return;
    }
    
    try {
      const fileNode = await vfs.readNodeByPath(selectedFile.path);
      if (fileNode && fileNode.content) {
        onOpen(selectedFile.path, fileNode.content as string);
        onClose();
      } else {
        setError(t('openModal.readError'));
      }
    } catch (err) {
      setError(t('openModal.readError'));
      console.error(err);
    }
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

  const getFileIcon = (node: FileSystemNode) => {
    if (node.type === 'directory') return '📁';
    if (node.name.endsWith('.html')) return '📄';
    if (node.name.endsWith('.json')) return '📊';
    return '📄';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('openModal.title', { app: getAppTitle() })}
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
              ⬆️ {t('openModal.goUp')}
            </button>
            <div className="flex-1 px-3 py-1 bg-gray-100 rounded text-sm text-gray-600 truncate">
              {currentPath}
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded mb-4 min-h-[200px]">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                {t('openModal.loading')}
              </div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('openModal.noFiles')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item)}
                    onDoubleClick={() => {
                      if (item.type === 'file') {
                        setSelectedFile(item);
                        handleOpen();
                      }
                    }}
                    className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-blue-50 text-left ${
                      selectedFile?.id === item.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <span className="text-xl">{getFileIcon(item)}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
                    {item.type === 'file' && (
                      <span className="text-xs text-gray-400">
                        {new Date(item.modifiedAt).toLocaleDateString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected File Display */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('openModal.selectedFile')}
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm text-gray-600 truncate">
              {selectedFile ? selectedFile.name : t('openModal.noFileSelected')}
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
            {t('openModal.cancel')}
          </button>
          <button
            onClick={handleOpen}
            disabled={!selectedFile}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded text-sm font-medium text-white transition-colors"
          >
            {t('openModal.open')}
          </button>
        </div>
      </div>
    </div>
  );
}
