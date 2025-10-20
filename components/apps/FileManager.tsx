'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import { vfs } from '@/lib/filesystem';
import type { FileSystemNode } from '@/types';

export default function FileManager({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState('/home');
  const [children, setChildren] = useState<FileSystemNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    try {
      const node = await vfs.readNodeByPath(path);
      if (node && node.type === 'directory') {
        const kids = await vfs.listChildren(node.id);
        setChildren(kids.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'directory' ? -1 : 1;
        }));
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    }
  };

  const handleFileClick = async (file: FileSystemNode) => {
    setSelectedFile(file);
    if (file.type === 'file' && typeof file.content === 'string') {
      setFileContent(file.content);
    } else {
      setFileContent('');
    }
  };

  const handleFileDoubleClick = async (file: FileSystemNode) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
      setSelectedFile(null);
      setFileContent('');
    }
  };

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      const newPath = '/' + parts.join('/');
      setCurrentPath(newPath || '/');
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
        <div className="space-y-2">
          <button
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors ${
              currentPath.startsWith('/home') ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => setCurrentPath('/home')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-sm">{t('fileManager.sidebar.home')}</span>
            </div>
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors ${
              currentPath === '/home/documents' ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => setCurrentPath('/home/documents')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm">{t('fileManager.sidebar.documents')}</span>
            </div>
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors ${
              currentPath === '/home/downloads' ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => setCurrentPath('/home/downloads')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              <span className="text-sm">{t('fileManager.sidebar.downloads')}</span>
            </div>
          </button>
          <button
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors ${
              currentPath === '/home/pictures' ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => setCurrentPath('/home/pictures')}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">{t('fileManager.sidebar.pictures')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={navigateUp}
            disabled={currentPath === '/'}
            title={t('fileManager.toolbar.goUp')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 bg-gray-100 px-3 py-1 rounded text-sm font-mono">{currentPath}</div>
        </div>

        <div className="flex-1 flex">
          {/* File List */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-4 gap-4">
              {children.map((node) => (
                <div
                  key={node.id}
                  className={`flex flex-col items-center p-4 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedFile?.id === node.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleFileClick(node)}
                  onDoubleClick={() => handleFileDoubleClick(node)}
                >
                  <div className="mb-2">
                    {node.type === 'directory' ? (
                      <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                      </svg>
                    ) : (
                      <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-center break-words max-w-full">{node.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          {selectedFile && (
            <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-auto">
              <h3 className="font-semibold mb-4">{t('fileManager.details.title')}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.name')}</div>
                  <div className="break-words">{selectedFile.name}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.type')}</div>
                  <div>{selectedFile.type === 'directory' ? t('fileManager.details.folder') : t('fileManager.details.file')}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.size')}</div>
                  <div>{formatSize(selectedFile.size)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.created')}</div>
                  <div>{formatDate(selectedFile.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.modified')}</div>
                  <div>{formatDate(selectedFile.modifiedAt)}</div>
                </div>
                {selectedFile.type === 'file' && fileContent && (
                  <div>
                    <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.preview')}</div>
                    <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono max-h-48 overflow-auto">
                      {fileContent}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
