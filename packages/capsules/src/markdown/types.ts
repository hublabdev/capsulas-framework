/**
 * @capsulas/capsules - Markdown Capsule Types
 */

/**
 * Markdown Configuration
 */
export interface MarkdownConfig {
  sanitize?: boolean;
  breaks?: boolean;
  gfm?: boolean; // GitHub Flavored Markdown
  highlight?: (code: string, lang: string) => string;
  linkify?: boolean;
  typographer?: boolean;
}

/**
 * Markdown Rendering Options
 */
export interface MarkdownRenderOptions {
  html?: boolean;
  xhtmlOut?: boolean;
  breaks?: boolean;
  langPrefix?: string;
  linkify?: boolean;
  typographer?: boolean;
  quotes?: string;
}

/**
 * Markdown Parse Result
 */
export interface MarkdownParseResult {
  html: string;
  text: string;
  tokens?: any[];
  metadata?: Record<string, any>;
}

/**
 * Markdown Sanitize Options
 */
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
  allowDataUris?: boolean;
}

/**
 * Markdown Stats
 */
export interface MarkdownStats {
  totalRenders: number;
  totalCharacters: number;
  averageRenderTime: number;
  errors: number;
}
