'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProps } from '@/types';

interface BatteryStatus {
  level: number;
  charging: boolean;
  supported: boolean;
}

export default function ControlCenter({ windowId: _windowId }: AppProps) {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    level: 100,
    charging: false,
    supported: false,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(50);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor battery status
  useEffect(() => {
    const getBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          type BatteryManager = {
            level: number;
            charging: boolean;
            addEventListener: (event: string, handler: () => void) => void;
            removeEventListener: (event: string, handler: () => void) => void;
          };
          
          const battery = await (navigator as { getBattery: () => Promise<BatteryManager> }).getBattery();
          const updateBatteryStatus = () => {
            setBatteryStatus({
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              supported: true,
            });
          };
          
          updateBatteryStatus();
          battery.addEventListener('levelchange', updateBatteryStatus);
          battery.addEventListener('chargingchange', updateBatteryStatus);
          
          return () => {
            battery.removeEventListener('levelchange', updateBatteryStatus);
            battery.removeEventListener('chargingchange', updateBatteryStatus);
          };
        } catch (error) {
          console.log('Battery API not supported:', error);
        }
      }
    };
    
    getBattery();
  }, []);

  // Monitor network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const formatTime = () => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getBatteryIcon = () => {
    if (!batteryStatus.supported) return '🔋';
    if (batteryStatus.charging) return '⚡';
    if (batteryStatus.level > 80) return '🔋';
    if (batteryStatus.level > 50) return '🔋';
    if (batteryStatus.level > 20) return '🪫';
    return '🪫';
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-4">
        {/* Header with Time and Date */}
        <section className="text-center space-y-1 py-2">
          <div className="text-4xl font-bold text-gray-900">{formatTime()}</div>
          <div className="text-xs text-gray-600">{formatDate()}</div>
        </section>

        {/* System Status */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 px-1">{t('controlCenter.systemStatus.title')}</h2>
          <div className="grid grid-cols-1 gap-2">
            {/* Battery Status */}
            <div className="bg-gray-100/80 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getBatteryIcon()}</span>
                  <span className="text-xs font-medium text-gray-700">{t('controlCenter.systemStatus.battery')}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  {batteryStatus.supported ? `${batteryStatus.level}%` : t('controlCenter.systemStatus.notAvailable')}
                </span>
              </div>
              {batteryStatus.supported && batteryStatus.charging && (
                <div className="mt-1 text-xs text-green-600">{t('controlCenter.systemStatus.charging')}</div>
              )}
            </div>

            {/* Network Status */}
            <div className="bg-gray-100/80 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isOnline ? '📶' : '📵'}</span>
                  <span className="text-xs font-medium text-gray-700">{t('controlCenter.systemStatus.network')}</span>
                </div>
                <span className={`text-xs font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? t('controlCenter.systemStatus.online') : t('controlCenter.systemStatus.offline')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Toggles */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 px-1">{t('controlCenter.quickToggles.title')}</h2>
          <div className="grid grid-cols-3 gap-2">
            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all ${
                darkMode ? 'bg-blue-500 text-white' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
                <span className="text-xs font-medium">{t('controlCenter.quickToggles.darkMode')}</span>
              </div>
            </button>

            {/* Do Not Disturb */}
            <button
              onClick={() => setDoNotDisturb(!doNotDisturb)}
              className={`p-3 rounded-xl transition-all ${
                doNotDisturb ? 'bg-purple-500 text-white' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{doNotDisturb ? '🔕' : '🔔'}</span>
                <span className="text-xs font-medium">{t('controlCenter.quickToggles.doNotDisturb')}</span>
              </div>
            </button>

            {/* Airplane Mode */}
            <button
              onClick={() => setAirplaneMode(!airplaneMode)}
              className={`p-3 rounded-xl transition-all ${
                airplaneMode ? 'bg-orange-500 text-white' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">✈️</span>
                <span className="text-xs font-medium">{t('controlCenter.quickToggles.airplaneMode')}</span>
              </div>
            </button>
          </div>
        </section>

        {/* Slider Controls */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900 px-1">{t('controlCenter.sliderControls.title')}</h2>
          <div className="space-y-3 bg-gray-100/80 rounded-xl p-3">
            {/* Brightness Control */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span className="text-xs font-medium text-gray-700">{t('controlCenter.sliderControls.brightness')}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{volume > 50 ? '🔊' : volume > 0 ? '🔉' : '🔇'}</span>
                  <span className="text-xs font-medium text-gray-700">{t('controlCenter.sliderControls.volume')}</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-2 pb-2">
          <h2 className="text-sm font-semibold text-gray-900 px-1">{t('controlCenter.quickActions.title')}</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gray-100/80 rounded-xl p-3 hover:bg-gray-200/80 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <span className="text-xs font-medium text-gray-700">{t('controlCenter.quickActions.screenshot')}</span>
              </div>
            </button>
            <button className="bg-gray-100/80 rounded-xl p-3 hover:bg-gray-200/80 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <span className="text-xs font-medium text-gray-700">{t('controlCenter.quickActions.lock')}</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
