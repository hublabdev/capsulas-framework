# PDF Generator Capsule

Generate PDF documents from HTML, URLs, markdown, or templates using multiple PDF generation providers.

## Features

- Multiple provider support (Puppeteer, PDFKit, jsPDF, html-pdf)
- Generate from HTML, URLs, Markdown, or templates
- Customizable page format (A4, Letter, Legal, A3, A5)
- Custom margins, headers, and footers
- Portrait and landscape orientation
- Statistics tracking
- TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Usage

### Generate PDF from HTML

```typescript
import { createPDFGeneratorService } from '@capsulas/capsules/pdf-generator';

const pdfService = createPDFGeneratorService({
  provider: 'puppeteer',
  outputDir: './pdfs'
});

await pdfService.initialize();

const result = await pdfService.fromHTML({
  html: '<h1>Hello World</h1><p>This is a PDF document.</p>',
  options: {
    format: 'A4',
    orientation: 'portrait',
    margin: {
      top: '2cm',
      right: '2cm',
      bottom: '2cm',
      left: '2cm'
    }
  }
});

console.log(result);
// {
//   success: true,
//   filePath: './pdfs/html_1730188800000.pdf',
//   buffer: <Buffer ...>,
//   size: 12345,
//   pages: 1,
//   format: 'A4',
//   provider: 'puppeteer',
//   timestamp: 2025-10-28T14:00:00.000Z
// }
```

### Generate PDF from URL

```typescript
const result = await pdfService.fromURL({
  url: 'https://example.com',
  options: {
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 10px; text-align: center;">Header</div>',
    footerTemplate: '<div style="font-size: 10px; text-align: center;">Page <span class="pageNumber"></span></div>'
  },
  waitUntil: 'networkidle0'
});
```

### Generate PDF from Markdown

```typescript
const markdown = `
# My Document

This is **bold** and this is *italic*.

## Features

- First feature
- Second feature
- Third feature

[Visit our website](https://example.com)
`;

const result = await pdfService.fromMarkdown({
  markdown,
  css: `
    body { font-family: Arial; }
    h1 { color: #333; }
  `
});
```

### Generate PDF from Template

```typescript
const template = `
  <html>
  <body>
    <h1>Invoice #{{ invoiceNumber }}</h1>
    <p>Customer: {{ customerName }}</p>
    <p>Total: ${{ total }}</p>
  </body>
  </html>
`;

const result = await pdfService.fromTemplate({
  template,
  data: {
    invoiceNumber: '12345',
    customerName: 'John Doe',
    total: 99.99
  },
  options: {
    format: 'A4'
  }
});
```

## API

### `createPDFGeneratorService(config: PDFGeneratorConfig): PDFGeneratorService`

Creates a new PDF generator service instance.

**Config:**
- `provider` - PDF provider ('puppeteer' | 'pdfkit' | 'jspdf' | 'html-pdf')
- `outputDir` - Directory for output files (default: './output')
- `defaultFormat` - Default page format (default: 'A4')
- `defaultOrientation` - Default orientation (default: 'portrait')

### `pdfService.initialize(): Promise<void>`

Initializes the service with the configured provider.

### `pdfService.fromHTML(request: PDFFromHTMLRequest): Promise<PDFResult>`

Generates a PDF from HTML content.

**Request:**
- `html` - HTML content (required)
- `options` - PDF options
- `outputPath` - Custom output path

### `pdfService.fromURL(request: PDFFromURLRequest): Promise<PDFResult>`

Generates a PDF from a URL.

**Request:**
- `url` - URL to generate PDF from (required)
- `options` - PDF options
- `outputPath` - Custom output path
- `waitUntil` - Wait condition ('load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2')

### `pdfService.fromMarkdown(request: PDFFromMarkdownRequest): Promise<PDFResult>`

Generates a PDF from Markdown content.

**Request:**
- `markdown` - Markdown content (required)
- `css` - Custom CSS
- `options` - PDF options
- `outputPath` - Custom output path

### `pdfService.fromTemplate(request: PDFFromTemplateRequest): Promise<PDFResult>`

Generates a PDF from a template with data.

**Request:**
- `template` - HTML template with {{ }} placeholders (required)
- `data` - Data to inject into template (required)
- `options` - PDF options
- `outputPath` - Custom output path

### PDF Options

- `format` - Page format ('A4' | 'Letter' | 'Legal' | 'A3' | 'A5')
- `orientation` - Page orientation ('portrait' | 'landscape')
- `margin` - Page margins
  - `top` - Top margin (e.g., '1cm', '10mm', '1in', 96)
  - `right` - Right margin
  - `bottom` - Bottom margin
  - `left` - Left margin
- `displayHeaderFooter` - Show header and footer (boolean)
- `headerTemplate` - HTML template for header
- `footerTemplate` - HTML template for footer
- `printBackground` - Print background graphics (boolean)
- `scale` - Scale of webpage rendering (0.1-2)
- `pageRanges` - Paper ranges to print (e.g., '1-5, 8, 11-13')

### `pdfService.getStats(): PDFStats`

Returns usage statistics.

**Stats:**
- `totalGenerated` - Total PDFs generated
- `totalFailed` - Total failed generations
- `totalPages` - Total pages generated
- `totalSize` - Total size in bytes
- `lastGenerated` - Last generation timestamp

## Examples

### Invoice Generator

```typescript
const invoiceHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; }
      .invoice-details { margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      .total { font-weight: bold; font-size: 18px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>INVOICE</h1>
      <p>#INV-2025-001</p>
    </div>
    <div class="invoice-details">
      <p><strong>Bill To:</strong> John Doe</p>
      <p><strong>Date:</strong> October 28, 2025</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Product A</td>
          <td>2</td>
          <td>$50.00</td>
          <td>$100.00</td>
        </tr>
        <tr>
          <td>Product B</td>
          <td>1</td>
          <td>$75.00</td>
          <td>$75.00</td>
        </tr>
      </tbody>
    </table>
    <p class="total">Total: $175.00</p>
  </body>
  </html>
`;

const result = await pdfService.fromHTML({
  html: invoiceHTML,
  options: {
    format: 'Letter',
    margin: {
      top: '1in',
      right: '1in',
      bottom: '1in',
      left: '1in'
    }
  },
  outputPath: './invoices/INV-2025-001.pdf'
});
```

### Report with Header and Footer

```typescript
const result = await pdfService.fromHTML({
  html: '<h1>Annual Report 2025</h1><p>Company performance summary...</p>',
  options: {
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px;">
        <strong>Company Annual Report 2025</strong>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; padding: 5px;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
    margin: {
      top: '2cm',
      bottom: '2cm'
    }
  }
});
```

### Landscape Certificate

```typescript
const certificate = `
  <div style="text-align: center; padding: 100px;">
    <h1 style="font-size: 48px;">Certificate of Achievement</h1>
    <p style="font-size: 24px; margin-top: 50px;">This certifies that</p>
    <h2 style="font-size: 36px; margin-top: 30px;">John Doe</h2>
    <p style="font-size: 20px; margin-top: 50px;">has successfully completed the course</p>
    <h3 style="font-size: 28px; margin-top: 30px;">Web Development Fundamentals</h3>
  </div>
`;

const result = await pdfService.fromHTML({
  html: certificate,
  options: {
    format: 'A4',
    orientation: 'landscape'
  }
});
```

### Check Statistics

```typescript
const stats = pdfService.getStats();

console.log(`Total generated: ${stats.totalGenerated}`);
console.log(`Success rate: ${((stats.totalGenerated - stats.totalFailed) / stats.totalGenerated * 100).toFixed(2)}%`);
console.log(`Total pages: ${stats.totalPages}`);
console.log(`Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
```

## Providers

### Puppeteer
- Headless Chrome for high-quality PDFs
- Best for converting web pages
- Supports CSS, JavaScript, fonts
- [Documentation](https://pptr.dev/)

### PDFKit
- Programmatic PDF generation
- Low-level control over PDF structure
- Great for documents from scratch
- [Documentation](https://pdfkit.org/)

### jsPDF
- Client-side PDF generation
- Works in browser and Node.js
- Lightweight and fast
- [Documentation](https://artskydj.github.io/jsPDF/)

### html-pdf
- PhantomJS-based generation
- Good HTML/CSS support
- Simple API
- [Documentation](https://github.com/marcbachmann/node-html-pdf)

## Best Practices

1. **Optimize Images**: Compress images before including in PDFs
2. **Font Loading**: Ensure custom fonts are properly loaded
3. **Page Breaks**: Use CSS `page-break-*` properties
4. **Testing**: Test PDFs in different viewers (Adobe, Chrome, etc.)
5. **Margins**: Leave adequate margins for printing
6. **File Size**: Monitor file sizes with `getStats()`

## Error Handling

```typescript
import {
  PDFGeneratorError,
  PDFProviderError,
  PDFValidationError
} from '@capsulas/capsules/pdf-generator';

try {
  await pdfService.fromHTML({...});
} catch (error) {
  if (error instanceof PDFValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof PDFProviderError) {
    console.error('Provider error:', error.message);
  } else if (error instanceof PDFGeneratorError) {
    console.error('PDF error:', error.message);
  }
}
```

## License

MIT
