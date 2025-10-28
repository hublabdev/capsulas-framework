/**
 * PDF Generator Capsule - Constants
 */

import { PDFGeneratorConfig, PDFOptions, PDFStats } from './types';

export const DEFAULT_PDF_CONFIG: Partial<PDFGeneratorConfig> = {
  outputDir: './output',
  defaultFormat: 'A4',
  defaultOrientation: 'portrait'
};

export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: 'A4',
  orientation: 'portrait',
  printBackground: true,
  displayHeaderFooter: false,
  margin: {
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm'
  }
};

export const INITIAL_STATS: PDFStats = {
  totalGenerated: 0,
  totalFailed: 0,
  totalPages: 0,
  totalSize: 0
};

export const PAGE_FORMATS = {
  A4: { width: 210, height: 297 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 }
};

export const DEFAULT_MARKDOWN_CSS = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    padding: 2cm;
    color: #333;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.2;
  }
  code {
    background-color: #f4f4f4;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  pre {
    background-color: #f4f4f4;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
  }
  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 1em;
    margin-left: 0;
    color: #666;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f4f4f4;
  }
`;
