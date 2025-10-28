# State Capsule ⊡

Reactive state management with listeners, selectors, and persistence.

## Features

- Reactive state updates
- Path-based access
- State listeners
- Selectors
- Time travel debugging
- State snapshots
- LocalStorage persistence
- Immutable updates
- Computed values

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createStateService } from '@capsulas/capsules/state';

const state = await createStateService({
  initialState: {
    user: null,
    count: 0,
    todos: [],
  },
  persist: true,
  storageKey: 'app-state',
});

// Set state
state.set('count', 1);
state.set('user', { id: 1, name: 'John' });

// Get state
const count = state.get('count'); // 1
const user = state.get('user'); // { id: 1, name: 'John' }

// Listen to changes
state.on('count', (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});

// Select derived state
const userName = state.select((s) => s.user?.name);
console.log(userName); // 'John'

// Update nested state
state.update('todos', (todos) => [...todos, { id: 1, text: 'Learn State' }]);
```

## License

MIT
