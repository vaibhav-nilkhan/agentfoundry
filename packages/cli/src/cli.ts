#!/usr/bin/env node
/**
 * AgentFoundry CLI
 * Command-line tool for building, validating, and publishing AI Skills
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { validateCommand } from './commands/validate';
import { publishCommand } from './commands/publish';
import { loginCommand } from './commands/login';
import { mcpCommand } from './commands/mcp';

const program = new Command();

program
  .name('agentfoundry')
  .description('CLI tool for AgentFoundry Skill development')
  .version('0.1.0');

// ASCII art banner
console.log(
  chalk.cyan(`
   ___                      _   _____                      _
  / _ \\                    | | |  ___|                    | |
 / /_\\ \\ __ _  ___ _ __ ___| |_| |_ ___  _   _ _ __   __| |_ __ _   _
 |  _  |/ _\` |/ _ \\ '_ \` _ \\ __|  _/ _ \\| | | | '_ \\ / _\` | '__| | | |
 | | | | (_| |  __/ | | | | |__| || (_) | |_| | | | | (_| | |  | |_| |
 \\_| |_/\\__, |\\___|_| |_| |_|__\\_| \\___/ \\__,_|_| |_|\\__,_|_|   \\__, |
         __/ |                                                    __/ |
        |___/                                                    |___/
`)
);

// Commands
program
  .command('init')
  .description('Initialize a new Skill project')
  .option('-t, --template <type>', 'Template type (basic, mcp, claude)', 'basic')
  .action(initCommand);

program
  .command('validate')
  .description('Validate a Skill manifest and code')
  .option('-f, --file <path>', 'Path to .claudeskill.md file')
  .action(validateCommand);

program
  .command('publish')
  .description('Publish a Skill to AgentFoundry marketplace')
  .option('-f, --file <path>', 'Path to .claudeskill.md file')
  .action(publishCommand);

program
  .command('login')
  .description('Authenticate with AgentFoundry')
  .action(loginCommand);

// Add MCP command
program.addCommand(mcpCommand);

program.parse();
