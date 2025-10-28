# Validator Capsule

**Data validation with schema support and custom rules**

## Features

✅ Schema-based validation
✅ Built-in rules (email, URL, numeric, etc.)
✅ Custom validation rules
✅ Nested object validation
✅ Statistics tracking
✅ 8 specialized error types

## Quick Start

```typescript
import { createValidatorService } from '@capsulas/capsules/validator';

const validator = await createValidatorService();

const schema = {
  email: {
    required: true,
    rules: [{ rule: 'email' }],
  },
  age: {
    type: 'number',
    rules: [
      { rule: 'min', value: 18 },
      { rule: 'max', value: 100 },
    ],
  },
};

const result = await validator.validate(
  { email: 'user@example.com', age: 25 },
  schema
);

if (result.valid) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

## Examples

### Email Validation

```typescript
const schema = {
  email: {
    required: true,
    rules: [{ rule: 'email', message: 'Invalid email format' }],
  },
};
```

### Custom Validator

```typescript
const schema = {
  password: {
    required: true,
    rules: [
      {
        rule: 'custom',
        validator: (value) => value.length >= 8,
        message: 'Password must be at least 8 characters',
      },
    ],
  },
};
```

### Nested Objects

```typescript
const schema = {
  user: {
    type: 'object',
    nested: {
      name: { required: true },
      email: { required: true, rules: [{ rule: 'email' }] },
    },
  },
};
```

## License

MIT License
