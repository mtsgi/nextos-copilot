# NextOS

A web-based operating system built with Next.js and TypeScript, providing a complete desktop environment within the browser.

## Features

- **Progressive Web App (PWA)**: Install and run as a standalone app with fullscreen support
- **Window Manager**: Full-featured window management with drag, resize, minimize, maximize, and close operations
- **Virtual Filesystem**: IndexedDB-powered filesystem for persistent storage
- **Process Management**: Track and manage running applications
- **Desktop Environment**: Modern UI with taskbar, dock, and desktop icons
- **Built-in Applications**:
  - File Manager: Browse and manage files
  - Terminal: Command-line interface
  - Text Editor: Create and edit text files
  - System Settings: Configure the OS

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
│   └── window-manager/    # Window management logic
├── types/                 # TypeScript type definitions
└── public/                # Static assets

```

## License

MIT
