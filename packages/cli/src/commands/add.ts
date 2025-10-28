import chalk from 'chalk';
import ora from 'ora';

export async function addCapsule(capsule: string) {
  const spinner = ora(`Adding capsule: ${capsule}...`).start();

  try {
    // TODO: Implement capsule installation
    spinner.succeed(chalk.green(`Added ${capsule}`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to add ${capsule}`));
    console.error(error);
    process.exit(1);
  }
}
