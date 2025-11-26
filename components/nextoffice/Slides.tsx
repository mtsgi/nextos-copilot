'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import { Slide } from '@/types/nextoffice';
import { vfs } from '@/lib/filesystem';
import OfficeToolbar, { ToolbarButton } from '@/components/nextoffice/common/OfficeToolbar';
import OfficeStatusBar from '@/components/nextoffice/common/OfficeStatusBar';
import SaveModal from '@/components/nextoffice/common/SaveModal';
import OpenModal from '@/components/nextoffice/common/OpenModal';

export default function Slides({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState(t('slides.untitled'));
  const [presentationMode, setPresentationMode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      order: 0,
      title: 'Slide 1',
      content: [],
      background: '#ffffff',
      transition: 'none',
    },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideContent, setSlideContent] = useState('');

  const currentSlide = slides[currentSlideIndex];

  const addSlide = () => {
    const newSlide: Slide = {
      id: (slides.length + 1).toString(),
      order: slides.length,
      title: `Slide ${slides.length + 1}`,
      content: [],
      background: '#ffffff',
      transition: 'none',
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length === 1) {
      alert('Cannot delete the last slide');
      return;
    }
    const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const duplicateSlide = () => {
    const duplicated: Slide = {
      ...currentSlide,
      id: (slides.length + 1).toString(),
      order: slides.length,
      title: `${currentSlide.title} (Copy)`,
    };
    setSlides([...slides, duplicated]);
    setCurrentSlideIndex(slides.length);
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const enterPresentationMode = () => {
    setPresentationMode(true);
    setCurrentSlideIndex(0);
  };

  const exitPresentationMode = () => {
    setPresentationMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (presentationMode) {
      if (e.key === 'Escape') {
        exitPresentationMode();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      }
    }
  };

  const handleSaveToFilesystem = async (path: string, name: string) => {
    try {
      await vfs.init();
      
      // Convert slides data to JSON for storage
      const slidesData = slides.map(slide => ({
        id: slide.id,
        order: slide.order,
        title: slide.title,
        content: slide.content,
        background: slide.background,
        transition: slide.transition,
      }));
      
      const content = JSON.stringify({ 
        slides: slidesData,
        currentTitle: slideTitle,
        currentContent: slideContent 
      }, null, 2);
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

  const handleOpenFromFilesystem = (filePath: string, content: string) => {
    try {
      const data = JSON.parse(content);
      if (data.slides && Array.isArray(data.slides)) {
        setSlides(data.slides);
        setCurrentSlideIndex(0);
        if (data.currentTitle) setSlideTitle(data.currentTitle);
        if (data.currentContent) setSlideContent(data.currentContent);
      }
      const name = filePath.split('/').pop() || t('slides.untitled');
      setFileName(name);
    } catch (error) {
      console.error('Failed to parse file:', error);
      alert(t('openModal.readError'));
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    { id: 'save', icon: '💾', label: t('slides.toolbar.save'), onClick: () => setShowSaveModal(true) },
    { id: 'open', icon: '📂', label: t('slides.toolbar.open'), onClick: () => setShowOpenModal(true) },
    { id: 'export', icon: '📤', label: t('slides.toolbar.export'), onClick: () => alert(t('slides.export.title')) },
    { id: 'sep1', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'newSlide', icon: '➕', label: t('slides.toolbar.newSlide'), onClick: addSlide },
    { id: 'deleteSlide', icon: '🗑️', label: t('slides.toolbar.deleteSlide'), onClick: deleteSlide },
    { id: 'duplicateSlide', icon: '📋', label: t('slides.toolbar.duplicateSlide'), onClick: duplicateSlide },
    { id: 'sep2', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'addText', icon: '📝', label: t('slides.toolbar.addText'), onClick: () => console.log('Add text') },
    { id: 'addImage', icon: '🖼️', label: t('slides.toolbar.addImage'), onClick: () => console.log('Add image') },
    { id: 'sep3', icon: '', label: '', onClick: () => {}, separator: true },
    { id: 'present', icon: '▶️', label: t('slides.toolbar.present'), onClick: enterPresentationMode },
  ];

  if (presentationMode) {
    return (
      <div
        className="h-full w-full bg-black flex items-center justify-center"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="w-full h-full flex flex-col">
          {/* Presentation Slide */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-8">
            <div
              className="w-full h-full max-w-6xl max-h-[80vh] rounded-lg shadow-2xl flex flex-col items-center justify-center p-4 sm:p-12"
              style={{ backgroundColor: currentSlide.background }}
            >
              <h1 className="text-2xl sm:text-5xl md:text-7xl font-bold text-gray-800 mb-4 sm:mb-8 text-center">
                {slideTitle || currentSlide.title}
              </h1>
              <p className="text-base sm:text-2xl md:text-3xl text-gray-600 text-center max-w-4xl">
                {slideContent}
              </p>
            </div>
          </div>

          {/* Presentation Controls - Compact on mobile */}
          <div className="bg-gray-900/90 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-between">
            <button
              className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
            >
              ← <span className="hidden sm:inline">{t('slides.presentation.previous')}</span>
            </button>
            <div className="text-white text-xs sm:text-sm">
              {currentSlideIndex + 1} / {slides.length}
            </div>
            <button
              className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <span className="hidden sm:inline">{t('slides.presentation.next')}</span> →
            </button>
          </div>

          {/* Exit Button */}
          <button
            className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs sm:text-base"
            onClick={exitPresentationMode}
          >
            {t('slides.presentation.exit')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <OfficeToolbar buttons={toolbarButtons}>
        <div className="flex-1" />
        <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none">{fileName}</div>
      </OfficeToolbar>

      {/* Main Content - Stacked on mobile */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Slide Thumbnails - Horizontal on mobile, vertical on desktop */}
        <div className="sm:w-48 bg-gray-100 border-b sm:border-b-0 sm:border-r border-gray-300 overflow-x-auto sm:overflow-y-auto p-2 flex sm:flex-col gap-2 sm:gap-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`flex-shrink-0 sm:flex-shrink sm:mb-2 p-2 border-2 rounded cursor-pointer transition-colors w-24 sm:w-auto ${
                currentSlideIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="text-xs font-medium text-gray-600 mb-1">{index + 1}</div>
              <div
                className="aspect-[16/9] bg-white rounded flex items-center justify-center text-xs text-gray-500 border border-gray-200"
                style={{ backgroundColor: slide.background }}
              >
                <span className="truncate px-1">{slide.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Editor */}
        <div className="flex-1 flex flex-col overflow-auto p-4 sm:p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto w-full">
            <div
              className="aspect-[16/9] bg-white rounded-lg shadow-lg p-4 sm:p-8 md:p-12 flex flex-col"
              style={{ backgroundColor: currentSlide.background }}
            >
              <input
                type="text"
                className="text-xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-6 bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="Slide Title"
                value={slideTitle}
                onChange={(e) => setSlideTitle(e.target.value)}
              />
              <textarea
                className="flex-1 text-sm sm:text-xl md:text-2xl text-gray-600 bg-transparent border-none outline-none resize-none placeholder-gray-400"
                placeholder="Slide content..."
                value={slideContent}
                onChange={(e) => setSlideContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Properties Panel - Hidden on mobile, shown on desktop or via toggle */}
        <div className="hidden sm:block w-64 bg-gray-100 border-l border-gray-300 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Slide Properties</h3>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              className="w-full h-8 rounded border border-gray-300"
              value={currentSlide.background}
              onChange={(e) => {
                const newSlides = [...slides];
                newSlides[currentSlideIndex].background = e.target.value;
                setSlides(newSlides);
              }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Transition</label>
            <select
              className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-sm"
              value={currentSlide.transition}
              onChange={(e) => {
                const newSlides = [...slides];
                newSlides[currentSlideIndex].transition = e.target.value as 'none' | 'fade' | 'slide';
                setSlides(newSlides);
              }}
            >
              <option value="none">{t('slides.transitions.none')}</option>
              <option value="fade">{t('slides.transitions.fade')}</option>
              <option value="slide">{t('slides.transitions.slide')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Properties Bar - Only on mobile */}
      <div className="sm:hidden bg-gray-100 border-t border-gray-300 p-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">BG:</span>
          <input
            type="color"
            className="w-8 h-6 rounded border border-gray-300"
            value={currentSlide.background}
            onChange={(e) => {
              const newSlides = [...slides];
              newSlides[currentSlideIndex].background = e.target.value;
              setSlides(newSlides);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Transition:</span>
          <select
            className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs"
            value={currentSlide.transition}
            onChange={(e) => {
              const newSlides = [...slides];
              newSlides[currentSlideIndex].transition = e.target.value as 'none' | 'fade' | 'slide';
              setSlides(newSlides);
            }}
          >
            <option value="none">{t('slides.transitions.none')}</option>
            <option value="fade">{t('slides.transitions.fade')}</option>
            <option value="slide">{t('slides.transitions.slide')}</option>
          </select>
        </div>
      </div>

      {/* Status Bar */}
      <OfficeStatusBar
        items={[
          {
            id: 'slide',
            label: t('slides.statusBar.slide'),
            value: `${currentSlideIndex + 1} ${t('slides.statusBar.of')} ${slides.length}`,
          },
        ]}
      />

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveToFilesystem}
        defaultFileName={fileName.endsWith('.json') ? fileName.replace('.json', '') : fileName}
        fileExtension=".json"
        appType="slides"
      />

      {/* Open Modal */}
      <OpenModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onOpen={handleOpenFromFilesystem}
        fileExtensions={['.json']}
        appType="slides"
      />
    </div>
  );
}
