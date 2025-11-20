'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';
import { Slide } from '@/types/nextoffice';
import OfficeToolbar, { ToolbarButton } from '@/components/nextoffice/common/OfficeToolbar';
import OfficeStatusBar from '@/components/nextoffice/common/OfficeStatusBar';

export default function Slides({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [fileName] = useState(t('slides.untitled'));
  const [presentationMode, setPresentationMode] = useState(false);
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

  const toolbarButtons: ToolbarButton[] = [
    { id: 'save', icon: '💾', label: t('slides.toolbar.save'), onClick: () => console.log('Save') },
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
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              className="w-full h-full max-w-6xl max-h-[80vh] rounded-lg shadow-2xl flex flex-col items-center justify-center p-12"
              style={{ backgroundColor: currentSlide.background }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 text-center">
                {slideTitle || currentSlide.title}
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 text-center max-w-4xl">
                {slideContent}
              </p>
            </div>
          </div>

          {/* Presentation Controls */}
          <div className="bg-gray-900/90 backdrop-blur-sm p-4 flex items-center justify-between">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
            >
              ← {t('slides.presentation.previous')}
            </button>
            <div className="text-white text-sm">
              {t('slides.statusBar.slide')} {currentSlideIndex + 1} {t('slides.statusBar.of')} {slides.length}
            </div>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              {t('slides.presentation.next')} →
            </button>
          </div>

          {/* Exit Button */}
          <button
            className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
        <div className="text-sm text-gray-600">{fileName}</div>
      </OfficeToolbar>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-48 bg-gray-100 border-r border-gray-300 overflow-y-auto p-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`mb-2 p-2 border-2 rounded cursor-pointer transition-colors ${
                currentSlideIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="text-xs font-medium text-gray-600 mb-1">{index + 1}</div>
              <div
                className="aspect-[16/9] bg-white rounded flex items-center justify-center text-xs text-gray-500 border border-gray-200"
                style={{ backgroundColor: slide.background }}
              >
                {slide.title}
              </div>
            </div>
          ))}
        </div>

        {/* Slide Editor */}
        <div className="flex-1 flex flex-col overflow-auto p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto w-full">
            <div
              className="aspect-[16/9] bg-white rounded-lg shadow-lg p-8 md:p-12 flex flex-col"
              style={{ backgroundColor: currentSlide.background }}
            >
              <input
                type="text"
                className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="Slide Title"
                value={slideTitle}
                onChange={(e) => setSlideTitle(e.target.value)}
              />
              <textarea
                className="flex-1 text-xl md:text-2xl text-gray-600 bg-transparent border-none outline-none resize-none placeholder-gray-400"
                placeholder="Slide content..."
                value={slideContent}
                onChange={(e) => setSlideContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 bg-gray-100 border-l border-gray-300 p-4 overflow-y-auto">
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
    </div>
  );
}
