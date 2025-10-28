# Theme Capsule ░

Theme and dark mode management with system preference detection and persistent storage.

## Features

- Light/dark/system modes
- Multiple color schemes
- CSS variable injection
- System preference sync
- LocalStorage persistence
- Custom color palettes
- Smooth transitions
- Real-time updates

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createThemeService } from '@capsulas/capsules/theme';

const theme = await createThemeService({
  mode: 'system',
  colorScheme: 'default',
  persistToStorage: true,
  syncWithSystem: true,
});

// Set theme mode
theme.setMode('dark');

// Set color scheme
theme.setColorScheme('blue');

// Get current theme
const current = theme.getTheme();
console.log(current.colors);

// Listen for changes
theme.on('change', (newTheme) => {
  console.log('Theme changed:', newTheme.mode);
});
```

## Color Schemes

- default (Sacred green/black)
- blue
- green
- purple
- orange
- red

## License

MIT
