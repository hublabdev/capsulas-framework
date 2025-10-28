/**
 * PDF Generator Capsule - Errors
 */

export class PDFGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PDFGeneratorError';
  }
}

export class PDFProviderError extends PDFGeneratorError {
  constructor(provider: string, message: string) {
    super(`${provider} error: ${message}`);
    this.name = 'PDFProviderError';
  }
}

export class PDFValidationError extends PDFGeneratorError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'PDFValidationError';
  }
}

export class PDFGenerationError extends PDFGeneratorError {
  constructor(message: string) {
    super(`Generation error: ${message}`);
    this.name = 'PDFGenerationError';
  }
}
