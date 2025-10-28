/**
 * PDF Generator Capsule - Adapters
 */

import * as fs from 'fs';
import {
  PDFGeneratorConfig,
  PDFProvider,
  PDFFromHTMLRequest,
  PDFFromURLRequest,
  PDFFromMarkdownRequest,
  PDFFromTemplateRequest,
  PDFResult
} from './types';
import { PDFProviderError } from './errors';
import { estimatePageCount } from './utils';

export abstract class PDFAdapter {
  protected config: PDFGeneratorConfig;

  constructor(config: PDFGeneratorConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult>;
  abstract fromURL(request: PDFFromURLRequest): Promise<PDFResult>;
  abstract getProvider(): PDFProvider;
}

export class PuppeteerPDFAdapter extends PDFAdapter {
  async initialize(): Promise<void> {
    // Puppeteer initialization would go here
    // In a real implementation, this would launch a browser instance
  }

  async fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult> {
    // Puppeteer implementation would go here
    // This is a mock implementation
    const buffer = Buffer.from('Mock PDF content');

    if (request.outputPath) {
      fs.writeFileSync(request.outputPath, buffer);
    }

    return {
      success: true,
      filePath: request.outputPath,
      buffer,
      size: buffer.length,
      pages: estimatePageCount(request.html.length),
      format: request.options?.format || this.config.defaultFormat || 'A4',
      provider: 'puppeteer',
      timestamp: new Date()
    };
  }

  async fromURL(request: PDFFromURLRequest): Promise<PDFResult> {
    // Puppeteer implementation would go here
    // This is a mock implementation
    const buffer = Buffer.from('Mock PDF content from URL');

    if (request.outputPath) {
      fs.writeFileSync(request.outputPath, buffer);
    }

    return {
      success: true,
      filePath: request.outputPath,
      buffer,
      size: buffer.length,
      pages: 1,
      format: request.options?.format || this.config.defaultFormat || 'A4',
      provider: 'puppeteer',
      timestamp: new Date()
    };
  }

  getProvider(): PDFProvider {
    return 'puppeteer';
  }
}

export class PDFKitAdapter extends PDFAdapter {
  async initialize(): Promise<void> {
    // PDFKit initialization
  }

  async fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult> {
    // PDFKit implementation would go here
    const buffer = Buffer.from('Mock PDF content with PDFKit');

    if (request.outputPath) {
      fs.writeFileSync(request.outputPath, buffer);
    }

    return {
      success: true,
      filePath: request.outputPath,
      buffer,
      size: buffer.length,
      pages: estimatePageCount(request.html.length),
      format: request.options?.format || this.config.defaultFormat || 'A4',
      provider: 'pdfkit',
      timestamp: new Date()
    };
  }

  async fromURL(request: PDFFromURLRequest): Promise<PDFResult> {
    throw new PDFProviderError('pdfkit', 'URL generation not supported by PDFKit');
  }

  getProvider(): PDFProvider {
    return 'pdfkit';
  }
}

export class JSPDFAdapter extends PDFAdapter {
  async initialize(): Promise<void> {
    // jsPDF initialization
  }

  async fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult> {
    // jsPDF implementation would go here
    const buffer = Buffer.from('Mock PDF content with jsPDF');

    if (request.outputPath) {
      fs.writeFileSync(request.outputPath, buffer);
    }

    return {
      success: true,
      filePath: request.outputPath,
      buffer,
      size: buffer.length,
      pages: estimatePageCount(request.html.length),
      format: request.options?.format || this.config.defaultFormat || 'A4',
      provider: 'jspdf',
      timestamp: new Date()
    };
  }

  async fromURL(request: PDFFromURLRequest): Promise<PDFResult> {
    throw new PDFProviderError('jspdf', 'URL generation not supported by jsPDF');
  }

  getProvider(): PDFProvider {
    return 'jspdf';
  }
}

export class HTMLPDFAdapter extends PDFAdapter {
  async initialize(): Promise<void> {
    // html-pdf initialization
  }

  async fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult> {
    // html-pdf implementation would go here
    const buffer = Buffer.from('Mock PDF content with html-pdf');

    if (request.outputPath) {
      fs.writeFileSync(request.outputPath, buffer);
    }

    return {
      success: true,
      filePath: request.outputPath,
      buffer,
      size: buffer.length,
      pages: estimatePageCount(request.html.length),
      format: request.options?.format || this.config.defaultFormat || 'A4',
      provider: 'html-pdf',
      timestamp: new Date()
    };
  }

  async fromURL(request: PDFFromURLRequest): Promise<PDFResult> {
    // html-pdf can support URLs
    const buffer = Buffer.from('Mock PDF content from URL');

    if (request.outputPath) {
      fs.writeFileSync(request.outputPath, buffer);
    }

    return {
      success: true,
      filePath: request.outputPath,
      buffer,
      size: buffer.length,
      pages: 1,
      format: request.options?.format || this.config.defaultFormat || 'A4',
      provider: 'html-pdf',
      timestamp: new Date()
    };
  }

  getProvider(): PDFProvider {
    return 'html-pdf';
  }
}

export function createAdapter(config: PDFGeneratorConfig): PDFAdapter {
  switch (config.provider) {
    case 'puppeteer':
      return new PuppeteerPDFAdapter(config);
    case 'pdfkit':
      return new PDFKitAdapter(config);
    case 'jspdf':
      return new JSPDFAdapter(config);
    case 'html-pdf':
      return new HTMLPDFAdapter(config);
    default:
      throw new PDFProviderError(
        config.provider,
        `Unsupported provider: ${config.provider}`
      );
  }
}
