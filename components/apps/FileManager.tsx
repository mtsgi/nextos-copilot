'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import { vfs } from '@/lib/filesystem';
import type { FileSystemNode } from '@/types';

type SortBy = 'name' | 'date' | 'size' | 'type';
type FilterBy = 'all' | 'files' | 'folders';
type ViewMode = 'grid' | 'list';

export default function FileManager({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState('/home');
  const [children, setChildren] = useState<FileSystemNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileSystemNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    try {
      const node = await vfs.readNodeByPath(path);
      if (node && node.type === 'directory') {
        const kids = await vfs.listChildren(node.id);
        setChildren(kids);
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
    }
  };

  // Filter files based on search query and filter type
  const getFilteredFiles = (): FileSystemNode[] => {
    let filtered = [...children];

    // Apply filter by type
    if (filterBy === 'files') {
      filtered = filtered.filter(node => node.type === 'file');
    } else if (filterBy === 'folders') {
      filtered = filtered.filter(node => node.type === 'directory');
    }

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(node =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'directory' ? -1 : 1;
        case 'date':
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'size':
          if (a.type === b.type) return b.size - a.size;
          return a.type === 'directory' ? -1 : 1;
        case 'type':
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'directory' ? -1 : 1;
        default:
          return 0;
      }
    });

    return filtered;
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
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile by default, shown as overlay */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-30
        w-48 bg-gray-50 border-r border-gray-200 p-4
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-2">
          <button
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors touch-manipulation min-h-[44px] ${
              currentPath.startsWith('/home') ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => {
              setCurrentPath('/home');
              setIsMobileMenuOpen(false);
            }}
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
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors touch-manipulation min-h-[44px] ${
              currentPath === '/home/documents' ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => {
              setCurrentPath('/home/documents');
              setIsMobileMenuOpen(false);
            }}
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
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors touch-manipulation min-h-[44px] ${
              currentPath === '/home/downloads' ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => {
              setCurrentPath('/home/downloads');
              setIsMobileMenuOpen(false);
            }}
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
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-200 transition-colors touch-manipulation min-h-[44px] ${
              currentPath === '/home/pictures' ? 'bg-blue-100 text-blue-700' : ''
            }`}
            onClick={() => {
              setCurrentPath('/home/pictures');
              setIsMobileMenuOpen(false);
            }}
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

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-2 md:px-4 py-2 space-y-2">
          {/* First row: Navigation and menu toggle */}
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors touch-manipulation md:hidden min-h-[44px] min-w-[44px]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title={t('fileManager.toolbar.menu')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={navigateUp}
              disabled={currentPath === '/'}
              title={t('fileManager.toolbar.goUp')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 bg-gray-100 px-3 py-1 rounded text-xs md:text-sm font-mono truncate min-h-[36px] flex items-center">
              {currentPath}
            </div>
          </div>

          {/* Second row: Search and controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('fileManager.toolbar.search')}
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm touch-manipulation min-h-[44px]"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation min-h-[44px]"
              title={t('fileManager.toolbar.sortBy')}
            >
              <option value="name">{t('fileManager.toolbar.sortName')}</option>
              <option value="date">{t('fileManager.toolbar.sortDate')}</option>
              <option value="size">{t('fileManager.toolbar.sortSize')}</option>
              <option value="type">{t('fileManager.toolbar.sortType')}</option>
            </select>

            {/* Filter dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterBy)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation min-h-[44px]"
              title={t('fileManager.toolbar.filterBy')}
            >
              <option value="all">{t('fileManager.toolbar.filterAll')}</option>
              <option value="files">{t('fileManager.toolbar.filterFiles')}</option>
              <option value="folders">{t('fileManager.toolbar.filterFolders')}</option>
            </select>

            {/* View mode toggle */}
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
                }`}
                title={t('fileManager.toolbar.gridView')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px] ${
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
                }`}
                title={t('fileManager.toolbar.listView')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* File List */}
          <div className="flex-1 p-2 md:p-4 overflow-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                {getFilteredFiles().map((node) => (
                  <div
                    key={node.id}
                    className={`flex flex-col items-center p-3 md:p-4 rounded cursor-pointer hover:bg-gray-100 transition-colors touch-manipulation ${
                      selectedFile?.id === node.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleFileClick(node)}
                    onDoubleClick={() => handleFileDoubleClick(node)}
                  >
                    <div className="mb-2">
                      {node.type === 'directory' ? (
                        <svg className="w-10 h-10 md:w-12 md:h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs md:text-sm text-center break-words max-w-full line-clamp-2">{node.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {getFilteredFiles().map((node) => (
                  <div
                    key={node.id}
                    className={`flex items-center gap-3 p-2 md:p-3 rounded cursor-pointer hover:bg-gray-100 transition-colors touch-manipulation min-h-[52px] ${
                      selectedFile?.id === node.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleFileClick(node)}
                    onDoubleClick={() => handleFileDoubleClick(node)}
                  >
                    <div className="flex-shrink-0">
                      {node.type === 'directory' ? (
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base font-medium truncate">{node.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span>{node.type === 'directory' ? t('fileManager.details.folder') : t('fileManager.details.file')}</span>
                        <span>•</span>
                        <span>{formatSize(node.size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{formatDate(node.modifiedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty state */}
            {getFilteredFiles().length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm md:text-base">{t('fileManager.emptyFolder')}</p>
              </div>
            )}
          </div>

          {/* Details Panel - Hidden on mobile when no file selected */}
          {selectedFile && (
            <div className="w-full md:w-64 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-4 overflow-auto max-h-[40vh] md:max-h-none">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{t('fileManager.details.title')}</h3>
                <button
                  className="md:hidden p-1 hover:bg-gray-200 rounded touch-manipulation"
                  onClick={() => setSelectedFile(null)}
                  title={t('fileManager.details.close')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
                  <div className="text-xs">{formatDate(selectedFile.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">{t('fileManager.details.modified')}</div>
                  <div className="text-xs">{formatDate(selectedFile.modifiedAt)}</div>
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
