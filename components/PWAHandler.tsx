'use client';

import { useEffect } from 'react';

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAHandler() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }

    // Handle beforeinstallprompt event
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('PWA install prompt available');
      
      // The deferredPrompt can be used later to show a custom install button
      // For now, we'll just log it and let the browser handle it naturally
      // You can add custom UI here if needed
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle successful installation
    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
      deferredPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null; // This component doesn't render anything
}
