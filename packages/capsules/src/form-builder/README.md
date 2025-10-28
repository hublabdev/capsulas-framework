# Form-Builder Capsule ▭

Dynamic form builder with validation, error handling, and field management.

## Features

- Dynamic field creation
- Multiple field types
- Built-in validation rules
- Custom validators
- Error messages
- Field dependencies
- Conditional fields
- Form submission
- Value transformations

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createFormBuilderService } from '@capsulas/capsules/form-builder';

const form = await createFormBuilderService({
  validateOnChange: true,
  validateOnBlur: true,
});

// Create form
const myForm = form.createForm({
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      validation: {
        rules: ['required', 'email'],
        message: 'Please enter a valid email',
      },
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      validation: {
        rules: ['required', 'min'],
        min: 8,
        message: 'Password must be at least 8 characters',
      },
    },
    {
      name: 'age',
      type: 'number',
      validation: {
        rules: ['min', 'max'],
        min: 18,
        max: 120,
      },
    },
  ],
});

// Set field value
myForm.setFieldValue('email', 'user@example.com');

// Validate
const isValid = myForm.validate();

// Get values
const values = myForm.getValues();

// Handle submit
myForm.onSubmit(async (values) => {
  console.log('Form submitted:', values);
  // Make API call, etc.
});
```

## Field Types

- text
- email
- password
- number
- tel
- url
- date
- time
- select
- checkbox
- radio
- textarea
- file

## Validation Rules

- required
- email
- min
- max
- pattern
- custom

## License

MIT
