/**
 * Init command - Initialize a new Skill project
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { getTemplate } from '../templates';

interface InitOptions {
  template?: string;
}

export async function initCommand(options: InitOptions) {
  console.log(chalk.blue('\n🚀 Creating a new AgentFoundry Skill...\n'));

  // Prompt for Skill details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Skill name:',
      validate: (input) => (input.length > 0 ? true : 'Name is required'),
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      validate: (input) => (input.length >= 10 ? true : 'Description must be at least 10 characters'),
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      validate: (input) => (input.length > 0 ? true : 'Author is required'),
    },
    {
      type: 'list',
      name: 'template',
      message: 'Template:',
      choices: [
        { name: 'Basic Skill', value: 'basic' },
        { name: 'MCP Server', value: 'mcp' },
        { name: 'Claude Skill', value: 'claude' },
      ],
      default: options.template || 'basic',
    },
  ]);

  const spinner = ora('Creating Skill files...').start();

  try {
    // Create project directory
    const projectDir = path.join(process.cwd(), answers.name.toLowerCase().replace(/\s+/g, '-'));
    await fs.ensureDir(projectDir);

    // Get template content
    const template = getTemplate(answers.template);
    const templateContent = template.generate(answers);

    // Write files
    await fs.writeFile(path.join(projectDir, `${answers.name}.claudeskill.md`), templateContent);
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify(
        {
          name: answers.name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          description: answers.description,
          main: 'index.js',
          author: answers.author,
        },
        null,
        2
      )
    );

    spinner.succeed(chalk.green('Skill project created successfully!'));

    console.log(chalk.cyan('\n📁 Project created at:'), projectDir);
    console.log(chalk.cyan('\n✨ Next steps:'));
    console.log(chalk.white(`  cd ${path.basename(projectDir)}`));
    console.log(chalk.white('  agentfoundry validate'));
    console.log(chalk.white('  agentfoundry publish\n'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to create Skill project'));
    console.error(error);
    process.exit(1);
  }
}
