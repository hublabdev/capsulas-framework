/**
 * PDF Generator Capsule - Service
 */

import {
  PDFGeneratorConfig,
  PDFFromHTMLRequest,
  PDFFromURLRequest,
  PDFFromMarkdownRequest,
  PDFFromTemplateRequest,
  PDFResult,
  PDFStats,
  PDFProvider
} from './types';
import { PDFGeneratorError } from './errors';
import { createAdapter, PDFAdapter } from './adapters';
import {
  validateHTML,
  validateURL,
  validateMarkdown,
  validateOutputPath,
  mergeOptions,
  generateOutputPath,
  wrapHTMLWithStyles
} from './utils';
import { DEFAULT_PDF_CONFIG, INITIAL_STATS, DEFAULT_MARKDOWN_CSS } from './constants';

export class PDFGeneratorService {
  private config: PDFGeneratorConfig;
  private adapter: PDFAdapter | null = null;
  private initialized: boolean = false;
  private stats: PDFStats;

  constructor(config: PDFGeneratorConfig) {
    this.config = { ...DEFAULT_PDF_CONFIG, ...config };
    this.stats = { ...INITIAL_STATS };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.adapter = createAdapter(this.config);
    await this.adapter.initialize();
    this.initialized = true;
  }

  async fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult> {
    if (!this.initialized || !this.adapter) {
      throw new PDFGeneratorError('Service not initialized. Call initialize() first.');
    }

    validateHTML(request.html);

    const outputPath = request.outputPath ||
      generateOutputPath(this.config.outputDir || './output', 'html');

    validateOutputPath(outputPath);

    const options = mergeOptions(request.options);

    try {
      const result = await this.adapter.fromHTML({
        ...request,
        outputPath,
        options
      });

      this.updateStats(result);

      return result;
    } catch (error) {
      this.stats.totalFailed++;
      throw error;
    }
  }

  async fromURL(request: PDFFromURLRequest): Promise<PDFResult> {
    if (!this.initialized || !this.adapter) {
      throw new PDFGeneratorError('Service not initialized. Call initialize() first.');
    }

    validateURL(request.url);

    const outputPath = request.outputPath ||
      generateOutputPath(this.config.outputDir || './output', 'url');

    validateOutputPath(outputPath);

    const options = mergeOptions(request.options);

    try {
      const result = await this.adapter.fromURL({
        ...request,
        outputPath,
        options
      });

      this.updateStats(result);

      return result;
    } catch (error) {
      this.stats.totalFailed++;
      throw error;
    }
  }

  async fromMarkdown(request: PDFFromMarkdownRequest): Promise<PDFResult> {
    validateMarkdown(request.markdown);

    // Convert markdown to HTML
    // In a real implementation, this would use a markdown parser
    const html = this.markdownToHTML(request.markdown);
    const wrappedHTML = wrapHTMLWithStyles(html, request.css || DEFAULT_MARKDOWN_CSS);

    return this.fromHTML({
      html: wrappedHTML,
      options: request.options,
      outputPath: request.outputPath
    });
  }

  async fromTemplate(request: PDFFromTemplateRequest): Promise<PDFResult> {
    // In a real implementation, this would use a templating engine
    const html = this.renderTemplate(request.template, request.data);

    return this.fromHTML({
      html,
      options: request.options,
      outputPath: request.outputPath
    });
  }

  getStats(): PDFStats {
    return { ...this.stats };
  }

  getProvider(): PDFProvider {
    if (!this.adapter) {
      throw new PDFGeneratorError('Service not initialized');
    }
    return this.adapter.getProvider();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private updateStats(result: PDFResult): void {
    if (result.success) {
      this.stats.totalGenerated++;
      this.stats.totalPages += result.pages;
      this.stats.totalSize += result.size;
      this.stats.lastGenerated = new Date();
    } else {
      this.stats.totalFailed++;
    }
  }

  private markdownToHTML(markdown: string): string {
    // Simple markdown to HTML conversion (mock)
    // In a real implementation, use a library like marked or markdown-it
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    return html;
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    // Simple template rendering (mock)
    // In a real implementation, use a library like handlebars or mustache
    let html = template;

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, String(value));
    }

    return html;
  }
}
