/**
 * @capsulas/capsules - Markdown Service
 */

import {
  MarkdownConfig,
  MarkdownParseResult,
  MarkdownStats,
  SanitizeOptions,
} from './types';
import { MarkdownAdapter, SimpleMarkdownAdapter } from './adapters';
import {
  markdownToText,
  sanitizeHtml,
  escapeHtml,
  extractFrontmatter,
  countWords,
  estimateReadingTime,
} from './utils';
import { DEFAULT_CONFIG } from './constants';

export class MarkdownService {
  private adapter: MarkdownAdapter;
  private stats: MarkdownStats = {
    totalRenders: 0,
    totalCharacters: 0,
    averageRenderTime: 0,
    errors: 0,
  };
  private renderTimes: number[] = [];

  constructor(private config: MarkdownConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.adapter = new SimpleMarkdownAdapter(this.config);
  }

  /**
   * Render markdown to HTML
   */
  render(markdown: string): string {
    const start = performance.now();

    try {
      const html = this.adapter.render(markdown);

      this.updateStats(markdown.length, performance.now() - start);

      return html;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Parse markdown and get detailed result
   */
  parse(markdown: string): MarkdownParseResult {
    const start = performance.now();

    try {
      const { frontmatter, content } = extractFrontmatter(markdown);
      const result = this.adapter.parse(content);

      result.metadata = {
        ...frontmatter,
        wordCount: countWords(content),
        readingTime: estimateReadingTime(content),
        characterCount: content.length,
      };

      this.updateStats(markdown.length, performance.now() - start);

      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * Convert markdown to plain text
   */
  toText(markdown: string): string {
    return markdownToText(markdown);
  }

  /**
   * Sanitize HTML
   */
  sanitize(html: string, options?: SanitizeOptions): string {
    return sanitizeHtml(html, options);
  }

  /**
   * Escape HTML special characters
   */
  escape(text: string): string {
    return escapeHtml(text);
  }

  /**
   * Extract frontmatter from markdown
   */
  extractFrontmatter(markdown: string): {
    frontmatter: Record<string, any> | null;
    content: string;
  } {
    return extractFrontmatter(markdown);
  }

  /**
   * Count words in markdown
   */
  countWords(markdown: string): number {
    return countWords(markdown);
  }

  /**
   * Estimate reading time
   */
  estimateReadingTime(markdown: string, wpm: number = 200): number {
    return estimateReadingTime(markdown, wpm);
  }

  /**
   * Get service statistics
   */
  getStats(): MarkdownStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalRenders: 0,
      totalCharacters: 0,
      averageRenderTime: 0,
      errors: 0,
    };
    this.renderTimes = [];
  }

  /**
   * Update statistics after render
   */
  private updateStats(characters: number, renderTime: number): void {
    this.stats.totalRenders++;
    this.stats.totalCharacters += characters;
    this.renderTimes.push(renderTime);

    // Calculate average render time
    const sum = this.renderTimes.reduce((acc, time) => acc + time, 0);
    this.stats.averageRenderTime = sum / this.renderTimes.length;

    // Keep only last 100 render times
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }
  }
}

/**
 * Factory function to create markdown service
 */
export function createMarkdownService(config?: MarkdownConfig): MarkdownService {
  return new MarkdownService(config);
}
