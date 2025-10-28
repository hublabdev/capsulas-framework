# I18n Capsule ✿

Internationalization and localization with support for multiple languages, pluralization, and formatting.

## Features

- Multi-language support
- Translation management
- Pluralization rules
- Number/date formatting
- Browser locale detection
- Fallback mechanism
- Interpolation
- Lazy loading

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createI18nService } from '@capsulas/capsules/i18n';

const i18n = await createI18nService({
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de'],
  translations: {
    en: {
      welcome: 'Welcome',
      greeting: 'Hello, {{name}}!',
      items: {
        one: '{{count}} item',
        other: '{{count}} items',
      },
    },
    es: {
      welcome: 'Bienvenido',
      greeting: '¡Hola, {{name}}!',
      items: {
        one: '{{count}} artículo',
        other: '{{count}} artículos',
      },
    },
  },
});

// Translate
const text = i18n.t('welcome'); // "Welcome"

// With interpolation
const greeting = i18n.t('greeting', { name: 'John' }); // "Hello, John!"

// Pluralization
const items = i18n.t('items', { count: 5 }); // "5 items"

// Change locale
i18n.setLocale('es');
```

## License

MIT
