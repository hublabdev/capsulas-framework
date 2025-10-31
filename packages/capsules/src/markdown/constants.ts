/**
 * @capsulas/capsules - Markdown Constants
 */

export const DEFAULT_CONFIG = {
  sanitize: true,
  breaks: true,
  gfm: true,
  linkify: true,
  typographer: false,
};

export const DEFAULT_ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'em', 'code', 'pre',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
];

export const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
  div: ['class', 'id'],
  span: ['class', 'id'],
};

export const DEFAULT_ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

export const GFM_EXTENSIONS = {
  tables: true,
  strikethrough: true,
  taskLists: true,
  autolink: true,
};
