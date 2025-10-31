/**
 * @capsulas/capsules - Markdown Capsule
 *
 * Markdown parsing and rendering with sanitization
 *
 * @category Content
 * @version 1.0.0
 */

// Export types
export type * from './types';

// Export errors
export * from './errors';

// Export constants
export * from './constants';

// Export utilities
export * from './utils';

// Export adapters
export { SimpleMarkdownAdapter, createAdapter } from './adapters';

// Export service
export { MarkdownService, createMarkdownService } from './service';

import { MarkdownService } from './service';
export default MarkdownService;

/**
 * Capsule metadata for Capsulas Framework
 */
export const markdownCapsule = {
  id: 'markdown',
  name: 'Markdown',
  description: 'Markdown parsing and rendering',
  icon: '◈',
  category: 'content',
  version: '1.0.0',

  inputs: [
    {
      id: 'content',
      name: 'Markdown Content',
      type: 'string',
      required: true,
      description: 'Markdown text to render',
    },
    {
      id: 'sanitize',
      name: 'Sanitize HTML',
      type: 'boolean',
      required: false,
      description: 'Whether to sanitize output HTML',
    },
  ],

  outputs: [
    {
      id: 'html',
      name: 'HTML Output',
      type: 'string',
      description: 'Rendered HTML',
    },
    {
      id: 'text',
      name: 'Plain Text',
      type: 'string',
      description: 'Plain text without formatting',
    },
    {
      id: 'metadata',
      name: 'Metadata',
      type: 'object',
      description: 'Document metadata (word count, reading time, etc.)',
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if rendering failed',
    },
  ],

  configSchema: {
    sanitize: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Sanitize HTML output to prevent XSS',
    },
    breaks: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Convert line breaks to <br>',
    },
    gfm: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Enable GitHub Flavored Markdown',
    },
  },

  examples: [
    {
      name: 'Basic Markdown Rendering',
      description: 'Convert markdown to HTML',
      code: `
import { createMarkdownService } from '@capsulas/capsules/markdown';

const markdown = createMarkdownService();

const html = markdown.render(\`
# Hello World

This is **bold** and this is *italic*.

- Item 1
- Item 2
- Item 3
\`);

console.log(html);
`,
    },
    {
      name: 'Parse with Metadata',
      description: 'Get detailed parsing results with metadata',
      code: `
import { createMarkdownService } from '@capsulas/capsules/markdown';

const markdown = createMarkdownService();

const result = markdown.parse(\`
---
title: My Article
author: John Doe
---

# Article Title

Content goes here...
\`);

console.log('HTML:', result.html);
console.log('Metadata:', result.metadata);
console.log('Word Count:', result.metadata.wordCount);
console.log('Reading Time:', result.metadata.readingTime, 'minutes');
`,
    },
    {
      name: 'Convert to Plain Text',
      description: 'Extract plain text from markdown',
      code: `
import { createMarkdownService } from '@capsulas/capsules/markdown';

const markdown = createMarkdownService();

const text = markdown.toText('# Hello **World**');
console.log(text); // "Hello World"
`,
    },
    {
      name: 'Custom Sanitization',
      description: 'Sanitize HTML with custom options',
      code: `
import { createMarkdownService } from '@capsulas/capsules/markdown';

const markdown = createMarkdownService({
  sanitize: true,
  gfm: true,
});

const html = markdown.render('# Safe Content');
console.log(html); // Sanitized HTML
`,
    },
  ],

  environmentVariables: [],

  tags: ['markdown', 'html', 'content', 'text', 'rendering'],

  links: {
    documentation: 'https://docs.capsulas.dev/capsules/markdown',
    github:
      'https://github.com/capsulas-framework/capsulas/tree/main/packages/capsules/src/markdown',
    npm: 'https://www.npmjs.com/package/@capsulas/capsules',
  },
};
