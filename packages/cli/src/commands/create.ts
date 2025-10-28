/**
 * Create command - Initialize new Capsulas project
 */

import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';

interface CreateOptions {
  template?: string;
}

export async function createProject(name: string, options: CreateOptions = {}) {
  const spinner = ora('Creating Capsulas project...').start();

  try {
    const projectPath = path.join(process.cwd(), name);

    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
      spinner.fail(chalk.red(`Directory ${name} already exists`));
      process.exit(1);
    }

    // Create project directory
    await fs.ensureDir(projectPath);

    // Create package.json
    const packageJson = {
      name,
      version: '0.1.0',
      description: `Capsulas project - ${name}`,
      scripts: {
        dev: 'capsulas dev',
        build: 'capsulas build',
        deploy: 'capsulas deploy'
      },
      dependencies: {
        '@capsulas/core': '^0.1.0'
      },
      devDependencies: {
        '@capsulas/cli': '^0.1.0',
        typescript: '^5.3.3'
      }
    };

    await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

    // Create .gitignore
    const gitignore = `node_modules/
dist/
.env
.env.local
*.log
.DS_Store`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

    // Create README.md
    const readme = `# ${name}

A Capsulas project.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Open visual editor
npm run dev

# Build for production
npm run build

# Deploy
npm run deploy
\`\`\`

## Learn More

- [Capsulas Documentation](https://docs.capsulas.dev)
- [Examples](https://github.com/yourusername/capsulas/tree/main/examples)
- [Discord Community](https://discord.gg/capsulas)
`;

    await fs.writeFile(path.join(projectPath, 'README.md'), readme);

    // Create flows directory
    await fs.ensureDir(path.join(projectPath, 'flows'));

    // Create example flow based on template
    const template = options.template || 'basic';
    const flowTemplate = getTemplateFlow(template);

    await fs.writeJSON(
      path.join(projectPath, 'flows', 'main.json'),
      flowTemplate,
      { spaces: 2 }
    );

    // Create .env.example
    const envExample = `# Capsulas Environment Variables
NODE_ENV=development
PORT=3040

# Database
DATABASE_URL=

# Auth
JWT_SECRET=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

# AI
OPENAI_API_KEY=

# Email
SENDGRID_API_KEY=

# Payments
STRIPE_SECRET_KEY=
`;

    await fs.writeFile(path.join(projectPath, '.env.example'), envExample);

    spinner.succeed(chalk.green(`Created ${name} successfully!`));

    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log();
    console.log(`  ${chalk.dim('$')} cd ${name}`);
    console.log(`  ${chalk.dim('$')} npm install`);
    console.log(`  ${chalk.dim('$')} npm run dev`);
    console.log();
    console.log(chalk.dim(`Template: ${template}`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    console.error(error);
    process.exit(1);
  }
}

function getTemplateFlow(template: string) {
  const baseFlow = {
    id: 'main',
    name: 'Main Flow',
    description: `Main flow for ${template} template`,
    nodes: [] as any[],
    connections: [] as any[],
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      template
    }
  };

  switch (template) {
    case 'saas':
      return {
        ...baseFlow,
        description: 'SaaS starter with auth, database, and payments',
        nodes: [
          {
            id: 'auth-1',
            capsule: { id: 'auth-oauth', name: 'OAuth' },
            position: { x: 100, y: 100 },
            config: { provider: 'google' }
          },
          {
            id: 'db-1',
            capsule: { id: 'database', name: 'Database' },
            position: { x: 400, y: 100 },
            config: { type: 'postgres' }
          }
        ]
      };

    case 'chatbot':
      return {
        ...baseFlow,
        description: 'AI chatbot with memory',
        nodes: [
          {
            id: 'ai-1',
            capsule: { id: 'ai-chat', name: 'AI Chat' },
            position: { x: 100, y: 100 },
            config: { model: 'gpt-4' }
          }
        ]
      };

    default:
      return baseFlow;
  }
}
