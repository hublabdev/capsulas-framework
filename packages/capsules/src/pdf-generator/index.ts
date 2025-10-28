export * from './types';
export * from './errors';
export * from './service';
export { PDFGeneratorService } from './service';

import { PDFGeneratorConfig } from './types';
import { PDFGeneratorService } from './service';

export function createPDFGeneratorService(config: PDFGeneratorConfig): PDFGeneratorService {
  return new PDFGeneratorService(config);
}
