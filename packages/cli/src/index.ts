#!/usr/bin/env node

/**
 * @capsulas/cli
 *
 * Command-line interface for Capsulas framework
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create';
import { addCapsule } from './commands/add';
import { removeCapsule } from './commands/remove';
import { listCapsules } from './commands/list';
import { devServer } from './commands/dev';
import { buildProject } from './commands/build';
import { deployProject } from './commands/deploy';

const program = new Command();

program
  .name('capsulas')
  .description('The WordPress of Apps - Build production-ready applications visually')
  .version('0.1.0');

// Create command
program
  .command('create <name>')
  .description('Create a new Capsulas project')
  .option('-t, --template <template>', 'Template to use (saas, ecommerce, chatbot)', 'basic')
  .action(createProject);

// Add capsule command
program
  .command('add <capsule>')
  .description('Add a capsule to your project')
  .action(addCapsule);

// Remove capsule command
program
  .command('remove <capsule>')
  .description('Remove a capsule from your project')
  .action(removeCapsule);

// List command
program
  .command('list')
  .description('List available capsules')
  .option('-c, --category <category>', 'Filter by category')
  .action(listCapsules);

// Dev command
program
  .command('dev')
  .description('Open visual editor')
  .option('-p, --port <port>', 'Port to run on', '3040')
  .action(devServer);

// Build command
program
  .command('build')
  .description('Build your project')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .action(buildProject);

// Deploy command
program
  .command('deploy')
  .description('Deploy to production')
  .option('--platform <platform>', 'Platform (vercel, railway, aws)', 'vercel')
  .action(deployProject);

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.cyan.bold('\n🎨 Capsulas Framework\n'));
  console.log(chalk.white('The WordPress of Apps - Build production-ready applications visually\n'));
  program.outputHelp();
}
