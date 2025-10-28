import chalk from 'chalk';

interface ListOptions {
  category?: string;
}

export async function listCapsules(options: ListOptions = {}) {
  console.log(chalk.cyan.bold('\n📦 Available Capsules\n'));

  const capsules = [
    { id: 'auth-jwt', name: 'JWT Auth', category: 'auth', desc: 'Token-based authentication' },
    { id: 'auth-oauth', name: 'OAuth', category: 'auth', desc: 'OAuth 2.0 with PKCE' },
    { id: 'database', name: 'Database', category: 'data', desc: 'SQL/NoSQL queries' },
    { id: 'ai-chat', name: 'AI Chat', category: 'ai', desc: 'OpenAI/Claude integration' },
    { id: 'email', name: 'Email', category: 'communication', desc: 'Send emails with templates' },
    { id: 'queue', name: 'Queue', category: 'processing', desc: 'Job queue with retry logic' },
    { id: 'cache', name: 'Cache', category: 'data', desc: 'Redis/Memory caching' },
    { id: 'file-storage', name: 'File Storage', category: 'storage', desc: 'S3/local file storage' },
    { id: 'webhook', name: 'Webhook', category: 'integration', desc: 'HTTP webhooks' },
    { id: 'websocket', name: 'WebSocket', category: 'communication', desc: 'Real-time connections' }
  ];

  const filtered = options.category
    ? capsules.filter(c => c.category === options.category)
    : capsules;

  if (filtered.length === 0) {
    console.log(chalk.yellow(`No capsules found for category: ${options.category}`));
    return;
  }

  filtered.forEach(capsule => {
    console.log(`  ${chalk.green('●')} ${chalk.bold(capsule.name)} ${chalk.dim(`(${capsule.id})`)}`);
    console.log(`    ${chalk.dim(capsule.desc)}`);
    console.log(`    ${chalk.cyan(`Category: ${capsule.category}`)}`);
    console.log();
  });

  console.log(chalk.dim(`Total: ${filtered.length} capsules\n`));
}
