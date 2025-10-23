# GitHub Copilot Instructions for NextOS

## Project Overview

NextOS is a web-based operating system built with Next.js 15 and TypeScript. It provides a complete desktop environment within the browser, featuring a window manager, virtual filesystem, process management, and built-in applications.

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **Storage**: IndexedDB for virtual filesystem persistence
- **State Management**: React Context API
- **Internationalization**: i18next and react-i18next
- **PWA**: Progressive Web App with service worker support

## Architecture Guidelines

### Project Structure

```
nextos-copilot/
├── app/                    # Next.js app directory (pages, layouts)
├── components/             # React components
│   ├── desktop/           # Desktop environment UI components
│   ├── window/            # Window manager components
│   └── apps/              # Built-in application components
├── lib/                   # Core libraries
│   ├── filesystem/        # Virtual filesystem implementation (IndexedDB)
│   ├── process/           # Process management
│   ├── window-manager/    # Window management logic
│   └── i18n/              # Internationalization configuration
├── types/                 # TypeScript type definitions
└── public/                # Static assets
    └── locales/           # Translation files (en, ja)
```

### Code Style and Conventions

1. **TypeScript**:
   - Use strict mode TypeScript
   - Prefer interfaces over types for object shapes
   - Define all types in `types/index.ts` or co-located with components
   - Use absolute imports with `@/` prefix (configured in tsconfig.json)

2. **React Components**:
   - Use functional components with hooks
   - Prefer React.ComponentType for component references
   - Use proper TypeScript types for component props
   - Export default for page components, named exports for utilities

3. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow the minimalist design philosophy inspired by Linux and macOS
   - Maintain consistent spacing and color schemes
   - Use responsive design patterns

4. **State Management**:
   - Use React Context API for global state
   - Keep component state local when possible
   - Use custom hooks for reusable stateful logic

### Core Concepts

#### Window Management
- Each window has a unique ID, bounds (position and size), and state (minimized, maximized, focused)
- Windows are managed through the window manager context
- Z-index determines window stacking order

#### Process Management
- Each running application is a process
- Processes track lifecycle: running, suspended, terminated
- Process IDs are linked to window IDs

#### Virtual Filesystem
- File and directory nodes stored in IndexedDB
- Each node has: id, name, type, path, parentId, content, size, timestamps
- Support for both text and binary content

#### Applications
- Applications are React components that receive windowId and onClose props
- Applications are categorized: system, utility, productivity
- Each app has an id, name, icon, and component reference

### Development Practices

1. **Internationalization**:
   - All user-facing strings should use i18next translation keys
   - Add new translations to `public/locales/en/translation.json` and `public/locales/ja/translation.json`
   - Use the `useTranslation` hook from react-i18next
   - Organize translation keys hierarchically (e.g., `app.settings.language`)

2. **PWA Support**:
   - Maintain PWA functionality for offline access
   - Update manifest.json for any new features or icons
   - Test fullscreen mode for standalone app experience

3. **Error Handling**:
   - Handle IndexedDB operations with proper error handling
   - Provide user feedback for errors
   - Gracefully degrade functionality when features are unavailable

4. **Performance**:
   - Minimize re-renders with proper React optimization (useMemo, useCallback)
   - Lazy load components when appropriate
   - Optimize bundle size with code splitting

### Testing and Building

- **Lint**: `npm run lint` (ESLint with Next.js and TypeScript rules)
- **Build**: `npm run build` (Next.js build with Turbopack)
- **Dev**: `npm run dev` (Development server with Turbopack)
- **Start**: `npm start` (Production server)

### Common Tasks

#### Adding a New Application

1. Create component in `components/apps/YourApp.tsx`
2. Define AppProps interface usage
3. Add translation keys for the app
4. Register in the application registry
5. Add icon and metadata

#### Modifying the Filesystem

1. Operations should use the filesystem context
2. Update IndexedDB through the filesystem API
3. Maintain parent-child relationships
4. Update timestamps on modifications

#### Adding UI Components

1. Create in appropriate `components/` subdirectory
2. Use Tailwind CSS for styling
3. Follow existing component patterns
4. Ensure responsive design
5. Support internationalization

### Design Philosophy

NextOS follows a minimalist design philosophy:
- Clean, intuitive interfaces
- Efficient resource usage
- Modular architecture
- Responsive design
- Cross-browser compatibility

### Important Notes

- The project uses Next.js 15 App Router (not Pages Router)
- Turbopack is enabled for faster builds
- TypeScript strict mode is enforced
- All components should be client-side when using hooks or browser APIs
- Use 'use client' directive for components with interactivity
