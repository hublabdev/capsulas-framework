/**
 * PDF Generator Capsule - Utils
 */

import * as path from 'path';
import * as fs from 'fs';
import { PDFOptions, PDFFormat, PDFMargin } from './types';
import { PDFValidationError } from './errors';
import { DEFAULT_PDF_OPTIONS } from './constants';

export function validateHTML(html: string): void {
  if (!html || html.trim().length === 0) {
    throw new PDFValidationError('HTML content is required');
  }
}

export function validateURL(url: string): void {
  if (!url || url.trim().length === 0) {
    throw new PDFValidationError('URL is required');
  }

  try {
    new URL(url);
  } catch (error) {
    throw new PDFValidationError('Invalid URL format');
  }
}

export function validateMarkdown(markdown: string): void {
  if (!markdown || markdown.trim().length === 0) {
    throw new PDFValidationError('Markdown content is required');
  }
}

export function validateOutputPath(outputPath: string): void {
  if (!outputPath || outputPath.trim().length === 0) {
    throw new PDFValidationError('Output path is required');
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      throw new PDFValidationError(`Cannot create output directory: ${dir}`);
    }
  }
}

export function mergeOptions(options?: PDFOptions): PDFOptions {
  return {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    margin: {
      ...DEFAULT_PDF_OPTIONS.margin,
      ...options?.margin
    }
  };
}

export function generateOutputPath(outputDir: string, prefix: string = 'document'): string {
  const timestamp = Date.now();
  const filename = `${prefix}_${timestamp}.pdf`;
  return path.join(outputDir, filename);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

export function marginToPixels(margin: string | number): number {
  if (typeof margin === 'number') {
    return margin;
  }

  // Convert cm/mm/in to pixels
  const match = margin.match(/^([\d.]+)(cm|mm|in|px)?$/);
  if (!match) {
    return 0;
  }

  const value = parseFloat(match[1]);
  const unit = match[2] || 'px';

  switch (unit) {
    case 'cm':
      return value * 37.8; // 1cm = 37.8px
    case 'mm':
      return value * 3.78; // 1mm = 3.78px
    case 'in':
      return value * 96; // 1in = 96px
    case 'px':
    default:
      return value;
  }
}

export function estimatePageCount(contentLength: number): number {
  // Rough estimate: ~3000 characters per page for average content
  const charsPerPage = 3000;
  return Math.max(1, Math.ceil(contentLength / charsPerPage));
}

export function wrapHTMLWithStyles(html: string, css?: string): string {
  const style = css ? `<style>${css}</style>` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${style}
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
}
