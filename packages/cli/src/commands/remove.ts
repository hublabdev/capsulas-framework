import chalk from 'chalk';
import ora from 'ora';

export async function removeCapsule(capsule: string) {
  const spinner = ora(`Removing capsule: ${capsule}...`).start();

  try {
    // TODO: Implement capsule removal
    spinner.succeed(chalk.green(`Removed ${capsule}`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to remove ${capsule}`));
    console.error(error);
    process.exit(1);
  }
}
