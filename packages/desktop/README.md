# Capsulas Desktop

Portable desktop application for Capsulas visual development framework.

## Features

- Native macOS, Windows, and Linux support
- File system integration for saving/loading flows
- Native menus and keyboard shortcuts
- Code export functionality
- Standalone executable

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Build for specific platform
npm run build:mac
npm run build:win
npm run build:linux
```

## Keyboard Shortcuts

### File Operations
- `Cmd/Ctrl + N` - New Project
- `Cmd/Ctrl + O` - Open Project
- `Cmd/Ctrl + S` - Save Flow
- `Cmd/Ctrl + Shift + S` - Save Flow As
- `Cmd/Ctrl + E` - Export Code

### Editing
- `Cmd/Ctrl + K` - Clear Canvas
- `Delete` - Delete selected node
- `Escape` - Deselect

### View
- `Cmd/Ctrl + B` - Toggle Settings Panel
- `Cmd/Ctrl + R` - Run Flow
- `Cmd/Ctrl + T` - Validate Flow

## Building Portable Apps

### macOS
```bash
npm run build:mac
```
Generates:
- `dist/Capsulas.dmg` - DMG installer
- `dist/Capsulas.app.zip` - Zipped app

### Windows
```bash
npm run build:win
```
Generates:
- `dist/Capsulas Setup.exe` - Installer
- `dist/Capsulas.exe` - Portable executable

### Linux
```bash
npm run build:linux
```
Generates:
- `dist/Capsulas.AppImage` - Portable AppImage
- `dist/Capsulas.deb` - Debian package

## Distribution

Distribute the built files from the `dist/` folder. Users can run them without installation (portable mode) or install them system-wide.

## Architecture

- **src/main.js** - Electron main process
- **src/preload.js** - Secure bridge between main and renderer
- **renderer/** - UI and application logic
- **assets/** - Icons and resources

## License

MIT
