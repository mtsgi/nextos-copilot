# NextOS

A web-based operating system built with Next.js and TypeScript, providing a complete desktop environment within the browser.

## Features

- **Progressive Web App (PWA)**: Install and run as a standalone app with fullscreen support
- **Window Manager**: Full-featured window management with drag, resize, minimize, maximize, and close operations
- **Virtual Filesystem**: IndexedDB-powered filesystem for persistent storage
- **Process Management**: Track and manage running applications
- **Desktop Environment**: Modern UI with taskbar, dock, and desktop icons
- **Internationalization (i18n)**: Support for multiple languages (English and Japanese) with persistent language selection
- **Built-in Applications**:
  - File Manager: Browse and manage files
  - Terminal: Command-line interface
  - Text Editor: Create and edit text files
  - Settings: Configure language and view system information

## Design Philosophy

NextOS follows a minimalist design philosophy inspired by Linux and macOS, emphasizing:
- Clean, intuitive interface
- Efficient resource usage
- Modular architecture
- Responsive design

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use NextOS.

## Progressive Web App (PWA)

NextOS can be installed as a Progressive Web App on supported browsers and devices. This allows you to:

- Install the app on your device's home screen
- Run the app in fullscreen mode without browser UI
- Access the app offline with service worker caching

For detailed testing and installation instructions, see [PWA_TESTING.md](./PWA_TESTING.md).

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB for virtual filesystem
- **State Management**: React Context API
- **Internationalization**: i18next and react-i18next

## Project Structure

```
nextos-copilot/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── desktop/           # Desktop environment components
│   ├── window/            # Window manager components
│   └── apps/              # Built-in applications
├── lib/                   # Core libraries
│   ├── filesystem/        # Virtual filesystem implementation
│   ├── process/           # Process management
│   ├── window-manager/    # Window management logic
│   └── i18n/              # Internationalization configuration
├── types/                 # TypeScript type definitions
├── public/                # Static assets
│   └── locales/           # Translation files (en, ja)
└── README.md
```

## Internationalization

NextOS supports multiple languages out of the box:

- **English** (en)
- **Japanese** (ja - 日本語)

### Changing Language

1. Open the **Settings** app from the desktop
2. Select your preferred language from the Language section
3. The interface will immediately update to reflect your choice
4. Your language preference is saved in localStorage and persists across sessions

### Adding New Languages

To add support for additional languages:

1. Create a new translation file in `public/locales/{language-code}/translation.json`
2. Copy the structure from `public/locales/en/translation.json`
3. Translate all strings to the target language
4. Update the Settings app to include the new language option

Translation files use the i18next format with nested keys for organization.

## License

MIT
