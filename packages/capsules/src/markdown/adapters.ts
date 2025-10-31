/**
 * @capsulas/capsules - Markdown Adapters
 */

import { MarkdownConfig, MarkdownParseResult } from './types';
import { simpleMarkdownToHtml, markdownToText, sanitizeHtml } from './utils';
import { RenderError } from './errors';

export interface MarkdownAdapter {
  render(markdown: string): string;
  parse(markdown: string): MarkdownParseResult;
}

/**
 * Simple Markdown Adapter (no external dependencies)
 */
export class SimpleMarkdownAdapter implements MarkdownAdapter {
  constructor(private config: MarkdownConfig = {}) {}

  render(markdown: string): string {
    try {
      let html = simpleMarkdownToHtml(markdown);

      if (this.config.sanitize) {
        html = sanitizeHtml(html);
      }

      return html;
    } catch (error) {
      throw new RenderError('Failed to render markdown', error);
    }
  }

  parse(markdown: string): MarkdownParseResult {
    try {
      const html = this.render(markdown);
      const text = markdownToText(markdown);

      return {
        html,
        text,
        tokens: [], // Simple adapter doesn't provide tokens
      };
    } catch (error) {
      throw new RenderError('Failed to parse markdown', error);
    }
  }
}

/**
 * Factory function to create markdown adapter
 */
export function createAdapter(config?: MarkdownConfig): MarkdownAdapter {
  return new SimpleMarkdownAdapter(config);
}
