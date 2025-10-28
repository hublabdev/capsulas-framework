# Router Capsule ◈

Client-side routing with hash and history modes, route guards, and dynamic parameters.

## Features

- Hash and history modes
- Dynamic route parameters
- Query string parsing
- Route guards
- Named routes
- Route metadata
- Not found handling
- Navigation history

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createRouterService } from '@capsulas/capsules/router';

const router = await createRouterService({
  mode: 'history',
  basePath: '/',
  routes: [
    {
      path: '/',
      name: 'home',
      handler: (ctx) => {
        console.log('Home page');
      },
    },
    {
      path: '/users/:id',
      name: 'user',
      handler: (ctx) => {
        console.log('User ID:', ctx.params.id);
      },
      beforeEnter: async (to) => {
        // Route guard
        return true; // or false to block
      },
    },
    {
      path: '/products',
      handler: (ctx) => {
        console.log('Query:', ctx.query);
      },
    },
  ],
});

// Navigate
router.push('/users/123');

// Navigate with query
router.push('/products?category=electronics');

// Go back
router.back();

// Go forward
router.forward();
```

## License

MIT
