/**
 * Validate command - Validate a Skill manifest and code
 */
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

interface ValidateOptions {
  file?: string;
}

export async function validateCommand(options: ValidateOptions) {
  console.log(chalk.blue('\n🔍 Validating Skill...\n'));

  const spinner = ora('Reading Skill file...').start();

  try {
    // Find .claudeskill.md file
    let skillFile = options.file;
    if (!skillFile) {
      const files = await fs.readdir(process.cwd());
      const claudeSkillFiles = files.filter((f) => f.endsWith('.claudeskill.md'));

      if (claudeSkillFiles.length === 0) {
        spinner.fail(chalk.red('No .claudeskill.md file found'));
        console.log(chalk.yellow('\nRun `agentfoundry init` to create a new Skill\n'));
        process.exit(1);
      }

      skillFile = claudeSkillFiles[0];
    }

    const skillPath = path.join(process.cwd(), skillFile);
    const content = await fs.readFile(skillPath, 'utf-8');

    spinner.text = 'Sending to validation service...';

    // TODO: Parse .claudeskill.md and extract manifest + code
    // For now, send raw content
    const validatorUrl = process.env.VALIDATOR_URL || 'http://localhost:5000';

    const response = await axios.post(`${validatorUrl}/api/v1/validate/skill`, {
      manifest: { name: 'Test', version: '1.0.0' },
      code: content,
    });

    const result = response.data;

    if (result.passed) {
      spinner.succeed(chalk.green('✅ Validation passed!'));
      console.log(chalk.cyan(`\n📊 Score: ${result.score}/100\n`));
    } else {
      spinner.fail(chalk.red('❌ Validation failed'));
      console.log(chalk.red('\n🚨 Issues found:\n'));
      result.issues.forEach((issue: string) => {
        console.log(chalk.red(`  • ${issue}`));
      });
      console.log('');
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Warnings:\n'));
      result.warnings.forEach((warning: string) => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
      console.log('');
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Validation failed'));
    if (error.response) {
      console.error(chalk.red('\n❌ Server error:'), error.response.data.detail);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(
        chalk.red('\n❌ Cannot connect to validator service at'),
        process.env.VALIDATOR_URL || 'http://localhost:5000'
      );
      console.log(chalk.yellow('\nMake sure the validator service is running\n'));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
