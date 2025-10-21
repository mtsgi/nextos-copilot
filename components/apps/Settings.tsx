'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';

export default function Settings({ windowId: _windowId }: AppProps) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Language Settings */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('settings.language.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('settings.language.description')}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                i18n.language === 'en' || i18n.language.startsWith('en-')
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
              onClick={() => changeLanguage('en')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('settings.language.english')}</span>
                {(i18n.language === 'en' || i18n.language.startsWith('en-')) && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
            <button
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                i18n.language === 'ja' || i18n.language.startsWith('ja-')
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
              onClick={() => changeLanguage('ja')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('settings.language.japanese')}</span>
                {(i18n.language === 'ja' || i18n.language.startsWith('ja-')) && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('settings.about.title')}</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center py-6">
              <div className="text-6xl">⚙️</div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">NextOS</h3>
              <p className="text-sm text-gray-600">{t('settings.about.version')}: 0.1.0</p>
              <p className="text-sm text-gray-600 max-w-md mx-auto">{t('settings.about.description')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
