/**
 * PDF Generator Capsule - Types
 * Generate PDF documents from HTML, markdown, or templates
 */

export type PDFProvider = 'puppeteer' | 'pdfkit' | 'jspdf' | 'html-pdf';

export interface PDFGeneratorConfig {
  provider: PDFProvider;
  outputDir?: string;
  defaultFormat?: PDFFormat;
  defaultOrientation?: PDFOrientation;
}

export type PDFFormat = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5';
export type PDFOrientation = 'portrait' | 'landscape';

export interface PDFOptions {
  format?: PDFFormat;
  orientation?: PDFOrientation;
  margin?: PDFMargin;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  scale?: number;
  pageRanges?: string;
}

export interface PDFMargin {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

export interface PDFFromHTMLRequest {
  html: string;
  options?: PDFOptions;
  outputPath?: string;
}

export interface PDFFromURLRequest {
  url: string;
  options?: PDFOptions;
  outputPath?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

export interface PDFFromMarkdownRequest {
  markdown: string;
  options?: PDFOptions;
  outputPath?: string;
  css?: string;
}

export interface PDFFromTemplateRequest {
  template: string;
  data: Record<string, any>;
  options?: PDFOptions;
  outputPath?: string;
}

export interface PDFResult {
  success: boolean;
  filePath?: string;
  buffer?: Buffer;
  size: number;
  pages: number;
  format: PDFFormat;
  provider: PDFProvider;
  timestamp: Date;
}

export interface PDFStats {
  totalGenerated: number;
  totalFailed: number;
  totalPages: number;
  totalSize: number;
  lastGenerated?: Date;
}
