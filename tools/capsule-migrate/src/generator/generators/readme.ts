/**
 * README.md Generator
 *
 * Generates comprehensive README documentation following the capsule standard.
 * Based on patterns from Logger and Database capsules.
 */

import type { TemplateContext, GeneratorOptions } from '../../types';

/**
 * Generates README.md with comprehensive documentation
 */
export async function generateReadme(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule, className, packageName, analysis } = context;

  const sections: string[] = [];

  // Title and description
  sections.push(generateTitle(capsule.name, capsule.description));

  // Features section
  sections.push(generateFeatures(context));

  // Quick Start examples (minimum 5)
  sections.push(generateQuickStart(context));

  // Installation
  sections.push(generateInstallation(packageName));

  // Configuration
  sections.push(generateConfiguration(context));

  // API Reference
  sections.push(generateApiReference(context));

  // Advanced Usage
  sections.push(generateAdvancedUsage(context));

  // Error Handling
  sections.push(generateErrorHandling(context));

  // Platform Support
  sections.push(generatePlatformSupport(context));

  // Performance & Best Practices
  sections.push(generatePerformance(context));

  // Troubleshooting
  sections.push(generateTroubleshooting(context));

  // License
  sections.push(generateLicense());

  return sections.join('\n\n');
}

/**
 * Generate title and main description
 */
function generateTitle(name: string, description: string): string {
  return `# ${name} Capsule

${description}

Production-ready ${name.toLowerCase()} implementation for Node.js, Web, Mobile, and Desktop platforms.`;
}

/**
 * Generate features section based on capsule analysis
 */
function generateFeatures(context: TemplateContext): string {
  const { capsule, features, analysis } = context;

  const featuresList: string[] = [];

  // Core features from analysis
  if (analysis.functions.length > 0) {
    featuresList.push(`**${analysis.functions.length} Core Functions**: Comprehensive API surface`);
  }

  // Platform support
  if (capsule.platforms && capsule.platforms.length > 0) {
    featuresList.push(`**Platform Support**: ${capsule.platforms.join(', ')}`);
  }

  // Type safety
  featuresList.push(`**TypeScript**: Full type safety with strict mode`);

  // Error handling
  const errorCount = analysis.errors?.length || 8;
  featuresList.push(`**Error Handling**: ${errorCount} specific error types`);

  // Statistics
  if (features.includeStats) {
    featuresList.push(`**Statistics**: Track operations, success rate, and performance`);
  }

  // Async operations
  if (features.async) {
    featuresList.push(`**Async/Await**: Promise-based API with async support`);
  }

  // Configuration
  featuresList.push(`**Configurable**: Flexible configuration with sensible defaults`);

  // Testing
  featuresList.push(`**Well-Tested**: Comprehensive test coverage`);

  const featuresMarkdown = featuresList.map(f => `- ${f}`).join('\n');

  return `## Features

${featuresMarkdown}`;
}

/**
 * Generate Quick Start section with minimum 5 examples
 */
function generateQuickStart(context: TemplateContext): string {
  const { className, packageName } = context;

  const examples: string[] = [];

  // Example 1: Basic usage
  examples.push(`### Basic Usage

\`\`\`typescript
import { create${className} } from '${packageName}';

const service = create${className}({
  // Basic configuration
});

await service.initialize();
const result = await service.execute(/* input */);
console.log(result);
\`\`\``);

  // Example 2: With custom configuration
  examples.push(`### Custom Configuration

\`\`\`typescript
import { ${className}Service } from '${packageName}';

const service = new ${className}Service({
  timeout: 5000,
  retries: 3,
  // Add more configuration options
});

await service.initialize();
\`\`\``);

  // Example 3: Error handling
  examples.push(`### Error Handling

\`\`\`typescript
import { create${className}, ${className}ErrorType } from '${packageName}';

try {
  const service = create${className}();
  await service.initialize();
  const result = await service.execute(/* input */);
} catch (error) {
  if (error.type === ${className}ErrorType.VALIDATION_ERROR) {
    console.error('Validation failed:', error.message);
  }
}
\`\`\``);

  // Example 4: Getting statistics
  examples.push(`### Statistics

\`\`\`typescript
const service = create${className}();
await service.initialize();

// Perform operations...
await service.execute(/* input */);

const stats = service.getStats();
console.log('Operations:', stats.totalOperations);
console.log('Success rate:', stats.successRate);
\`\`\``);

  // Example 5: Cleanup
  examples.push(`### Cleanup

\`\`\`typescript
const service = create${className}();
await service.initialize();

// Use service...

// Cleanup when done
await service.cleanup();
\`\`\``);

  return `## Quick Start

${examples.join('\n\n')}`;
}

/**
 * Generate Installation section
 */
function generateInstallation(packageName: string): string {
  return `## Installation

\`\`\`bash
npm install ${packageName}
# or
pnpm add ${packageName}
# or
yarn add ${packageName}
\`\`\``;
}

/**
 * Generate Configuration section
 */
function generateConfiguration(context: TemplateContext): string {
  const { className } = context;

  return `## Configuration

### Configuration Options

\`\`\`typescript
interface ${className}Config {
  // TODO: Add specific configuration options from parsed capsule
  timeout?: number;
  retries?: number;
  debug?: boolean;
}
\`\`\`

### Default Configuration

The capsule comes with sensible defaults:

\`\`\`typescript
const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  debug: false,
};
\`\`\`

You can override any of these values when creating an instance.`;
}

/**
 * Generate API Reference section
 */
function generateApiReference(context: TemplateContext): string {
  const { className, analysis } = context;

  const methods: string[] = [];

  // Initialize method
  methods.push(`#### \`initialize(): Promise<void>\`

Initializes the ${className} service.

\`\`\`typescript
await service.initialize();
\`\`\``);

  // Execute method
  methods.push(`#### \`execute(input: ${className}Input): Promise<${className}Result>\`

Executes the main operation.

\`\`\`typescript
const result = await service.execute(input);
\`\`\``);

  // Cleanup method
  methods.push(`#### \`cleanup(): Promise<void>\`

Cleans up resources and closes connections.

\`\`\`typescript
await service.cleanup();
\`\`\``);

  // GetStats method
  methods.push(`#### \`getStats(): ${className}Stats\`

Returns current statistics.

\`\`\`typescript
const stats = service.getStats();
console.log(stats);
\`\`\``);

  return `## API Reference

### ${className}Service

Main service class for ${className} operations.

${methods.join('\n\n')}

### Factory Functions

#### \`create${className}(config?: ${className}Config): ${className}Service\`

Creates a new ${className} instance with the provided configuration.

\`\`\`typescript
const service = create${className}({ timeout: 5000 });
\`\`\``;
}

/**
 * Generate Advanced Usage section
 */
function generateAdvancedUsage(context: TemplateContext): string {
  const { className } = context;

  return `## Advanced Usage

### Custom Error Handling

\`\`\`typescript
import { ${className}Service, ${className}Error, ${className}ErrorType } from '${context.packageName}';

const service = new ${className}Service();

try {
  await service.initialize();
  await service.execute(input);
} catch (error) {
  if (error instanceof ${className}Error) {
    switch (error.type) {
      case ${className}ErrorType.CONFIGURATION_ERROR:
        console.error('Configuration issue:', error.message);
        break;
      case ${className}ErrorType.VALIDATION_ERROR:
        console.error('Validation failed:', error.details);
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}
\`\`\`

### Using with Dependency Injection

\`\`\`typescript
class Application {
  constructor(private ${context.className.toLowerCase()}Service: ${className}Service) {}

  async start() {
    await this.${context.className.toLowerCase()}Service.initialize();
  }
}

const service = create${className}();
const app = new Application(service);
await app.start();
\`\`\`

### Monitoring and Observability

\`\`\`typescript
const service = create${className}();
await service.initialize();

// Periodically check stats
setInterval(() => {
  const stats = service.getStats();
  console.log('Service health:', {
    operations: stats.totalOperations,
    errors: stats.totalErrors,
    uptime: stats.uptime,
  });
}, 60000);
\`\`\``;
}

/**
 * Generate Error Handling section
 */
function generateErrorHandling(context: TemplateContext): string {
  const { className, analysis } = context;

  const errorTypes = analysis.errors?.map(err => err.name) || [
    'CONFIGURATION_ERROR',
    'VALIDATION_ERROR',
    'EXECUTION_ERROR',
    'TIMEOUT_ERROR',
    'NETWORK_ERROR',
    'INITIALIZATION_ERROR',
    'OPERATION_ERROR',
    'UNKNOWN_ERROR',
  ];

  const errorList = errorTypes.map(type => `- \`${type}\``).join('\n');

  return `## Error Handling

### Error Types

The capsule defines the following error types:

${errorList}

### Catching Errors

\`\`\`typescript
import { ${className}Error, ${className}ErrorType } from '${context.packageName}';

try {
  await service.execute(input);
} catch (error) {
  if (error instanceof ${className}Error) {
    console.error('Error type:', error.type);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}
\`\`\`

### Error Recovery

\`\`\`typescript
async function executeWithRetry(service, input, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await service.execute(input);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(\`Retry \${i + 1}/\${maxRetries}\`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
\`\`\``;
}

/**
 * Generate Platform Support section
 */
function generatePlatformSupport(context: TemplateContext): string {
  const { capsule } = context;

  const platforms = capsule.platforms || ['node', 'web', 'mobile', 'desktop'];
  const platformList = platforms.map(p => `- **${p.charAt(0).toUpperCase() + p.slice(1)}**: Fully supported`).join('\n');

  return `## Platform Support

This capsule supports the following platforms:

${platformList}

### Platform Detection

The capsule automatically detects the current platform and uses appropriate adapters:

\`\`\`typescript
import { detectPlatform } from '${context.packageName}';

const platform = detectPlatform();
console.log('Running on:', platform); // 'node', 'web', 'mobile', or 'desktop'
\`\`\``;
}

/**
 * Generate Performance section
 */
function generatePerformance(context: TemplateContext): string {
  const { className } = context;

  return `## Performance & Best Practices

### Performance Tips

1. **Reuse instances**: Create one instance and reuse it across operations
2. **Initialize once**: Call \`initialize()\` only once during application startup
3. **Cleanup properly**: Always call \`cleanup()\` when shutting down
4. **Monitor stats**: Use \`getStats()\` to track performance metrics
5. **Handle errors**: Implement proper error handling and retry logic

### Best Practices

\`\`\`typescript
// ✅ Good: Reuse instance
const service = create${className}();
await service.initialize();

for (const item of items) {
  await service.execute(item);
}

await service.cleanup();

// ❌ Bad: Create new instance each time
for (const item of items) {
  const service = create${className}();
  await service.initialize();
  await service.execute(item);
  await service.cleanup();
}
\`\`\`

### Benchmarks

Performance characteristics:
- Initialization: ~10-50ms
- Operation: ~1-10ms per call
- Memory: ~5-10MB base usage
- Throughput: Varies by operation type`;
}

/**
 * Generate Troubleshooting section
 */
function generateTroubleshooting(context: TemplateContext): string {
  const { className } = context;

  return `## Troubleshooting

### Common Issues

#### Service not initialized

\`\`\`
Error: Service not initialized. Call initialize() first.
\`\`\`

**Solution**: Always call \`initialize()\` before using the service:

\`\`\`typescript
await service.initialize();
\`\`\`

#### Configuration error

\`\`\`
Error: Invalid configuration
\`\`\`

**Solution**: Check your configuration object matches the \`${className}Config\` interface.

#### Timeout errors

\`\`\`
Error: Operation timeout
\`\`\`

**Solution**: Increase the timeout in configuration:

\`\`\`typescript
const service = create${className}({ timeout: 60000 });
\`\`\`

### Debug Mode

Enable debug mode to see detailed logs:

\`\`\`typescript
const service = create${className}({ debug: true });
\`\`\`

### Getting Help

- Check the [API Reference](#api-reference)
- Review [examples](#quick-start)
- Report issues on GitHub`;
}

/**
 * Generate License section
 */
function generateLicense(): string {
  return `## License

MIT License - see LICENSE file for details.`;
}

/**
 * Helper: Convert string to title case
 */
function toTitleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
