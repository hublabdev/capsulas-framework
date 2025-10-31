/**
 * @capsulas/capsules - Markdown Errors
 */

export enum MarkdownErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  SANITIZE_ERROR = 'SANITIZE_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
}

export class MarkdownError extends Error {
  constructor(
    public type: MarkdownErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MarkdownError';
  }
}

export class ParseError extends MarkdownError {
  constructor(message: string, details?: any) {
    super(MarkdownErrorType.PARSE_ERROR, message, details);
    this.name = 'ParseError';
  }
}

export class RenderError extends MarkdownError {
  constructor(message: string, details?: any) {
    super(MarkdownErrorType.RENDER_ERROR, message, details);
    this.name = 'RenderError';
  }
}

export class SanitizeError extends MarkdownError {
  constructor(message: string, details?: any) {
    super(MarkdownErrorType.SANITIZE_ERROR, message, details);
    this.name = 'SanitizeError';
  }
}
