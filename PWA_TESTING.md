# PWA Testing and Installation Guide

This document provides instructions for testing and verifying the PWA (Progressive Web App) functionality of NextOS.

## PWA Features Implemented

- **Fullscreen Display Mode**: The app launches in fullscreen mode, hiding browser UI
- **Add to Homescreen (A2HS)**: Users can install the app on their devices
- **Service Worker**: Enables offline support and caching
- **App Icons**: Multiple icon sizes for different devices (192x192, 512x512, 180x180 for Apple)
- **Cross-browser Support**: Compatible with Chrome, Safari, Edge, and Firefox

## Testing PWA Installation

### Prerequisites
- The app must be served over HTTPS (or localhost for development)
- A service worker must be registered successfully

### Development Testing (localhost)

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   or for production build:
   ```bash
   npm run build
   npm start
   ```

2. **Open the app in your browser:**
   - Navigate to `http://localhost:3000`

3. **Verify Service Worker Registration:**
   - Open Developer Tools (F12)
   - Go to the "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
   - Check "Service Workers" section
   - You should see `service-worker.js` registered and active

4. **Test PWA Manifest:**
   - In Developer Tools > Application tab
   - Click on "Manifest" in the left sidebar
   - Verify all fields are populated correctly:
     - Name: "NextOS - Web-Based Operating System"
     - Short name: "NextOS"
     - Display: "fullscreen"
     - Icons: 192x192 and 512x512

### Testing on Chrome/Edge

1. **Desktop:**
   - Click the install icon in the address bar (+ icon or computer icon)
   - Or: Menu (⋮) > "Install NextOS..."
   - Follow the installation prompt
   - The app will open in a standalone window

2. **Mobile (Android):**
   - Open Chrome on your Android device
   - Navigate to the app URL
   - Tap the "Add to Home Screen" banner when it appears
   - Or: Menu (⋮) > "Add to Home Screen"
   - The app icon will appear on your home screen
   - Launch the app - it should open in fullscreen mode

### Testing on Safari (iOS/macOS)

1. **iOS:**
   - Open Safari on your iPhone/iPad
   - Navigate to the app URL
   - Tap the Share button (box with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Edit the name if desired and tap "Add"
   - The app icon will appear on your home screen
   - Launch the app - it should open in fullscreen mode

2. **macOS:**
   - Safari doesn't fully support PWA installation
   - The service worker will still cache resources for offline use

### Testing on Firefox

1. **Desktop:**
   - Firefox doesn't support PWA installation on desktop
   - The service worker will still function for offline support

2. **Mobile (Android):**
   - Open Firefox on your Android device
   - Navigate to the app URL
   - Tap the Home icon in the address bar
   - Or: Menu > "Install"
   - Follow the installation prompt

## Verifying Fullscreen Mode

After installation:

1. **Close all browser windows/tabs**
2. **Launch the app from:**
   - Desktop: Start menu, Desktop shortcut, or Taskbar
   - Mobile: Home screen icon
3. **Verify:**
   - No browser address bar is visible
   - No browser navigation buttons
   - App takes up entire screen
   - System status bar may still be visible (depends on OS)

## Browser Compatibility

| Browser | Platform | A2HS Support | Fullscreen Support | Service Worker |
|---------|----------|--------------|-------------------|----------------|
| Chrome  | Desktop  | ✅ Yes       | ✅ Yes            | ✅ Yes         |
| Chrome  | Android  | ✅ Yes       | ✅ Yes            | ✅ Yes         |
| Edge    | Desktop  | ✅ Yes       | ✅ Yes            | ✅ Yes         |
| Edge    | Android  | ✅ Yes       | ✅ Yes            | ✅ Yes         |
| Safari  | iOS      | ✅ Yes       | ✅ Yes            | ✅ Yes         |
| Safari  | macOS    | ⚠️ Limited   | ❌ No             | ✅ Yes         |
| Firefox | Desktop  | ❌ No        | ❌ No             | ✅ Yes         |
| Firefox | Android  | ✅ Yes       | ✅ Yes            | ✅ Yes         |

## Troubleshooting

### Service Worker Not Registering

1. **Check Console Errors:**
   - Open Developer Tools > Console
   - Look for service worker registration errors

2. **Clear Cache:**
   - Developer Tools > Application > Storage
   - Click "Clear site data"
   - Refresh the page

3. **Verify HTTPS:**
   - Service workers require HTTPS (except on localhost)
   - Ensure your production deployment uses HTTPS

### Install Prompt Not Showing

1. **Check PWA Criteria:**
   - Valid manifest.json
   - Service worker registered
   - Served over HTTPS
   - Site visited at least twice with 5 minutes between visits (Chrome)

2. **Check Browser Support:**
   - Some browsers don't support A2HS
   - See compatibility table above

3. **Already Installed:**
   - If the app is already installed, the prompt won't appear
   - Uninstall and try again

### App Not Opening in Fullscreen

1. **Check Manifest:**
   - Verify `display: "fullscreen"` in manifest.json
   - Try clearing cache and reinstalling

2. **Platform Limitations:**
   - Some platforms may override fullscreen preference
   - iOS always shows status bar
   - Desktop may show title bar depending on OS

## Production Deployment

For production deployment:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to a hosting service with HTTPS:**
   - Vercel (recommended for Next.js apps)
   - Netlify
   - AWS Amplify
   - Any other hosting service with HTTPS

3. **Verify PWA works in production:**
   - Visit the deployed URL
   - Follow the testing steps above

## Additional Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA Checklist](https://web.dev/pwa-checklist/)
- [Next.js: PWA Guide](https://nextjs.org/docs/app/api-reference/components/meta/progressive-web-apps)
- [Chrome: Install Criteria](https://web.dev/install-criteria/)

## Support

If you encounter issues with PWA functionality:

1. Check the console for errors
2. Verify all files are present in the `public/` directory
3. Ensure the service worker is registered
4. Clear browser cache and try again
5. Test in a different browser
