#!/usr/bin/env node
/**
 * AgentFoundry CLI
 * Command-line tool for building, validating, and publishing AI Skills
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { watchCommand } from './commands/watch';
import { statsCommand } from './commands/stats';

import { costsCommand } from './commands/costs';
import { historyCommand } from './commands/history';
import { recommendCommand } from './commands/recommend';
import { benchmarkCommand } from './commands/benchmark';
import { optimizeCommand } from './commands/optimize';

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

// Agent Tracker Commands
program.addCommand(watchCommand);
program.addCommand(statsCommand);
program.addCommand(costsCommand);
program.addCommand(historyCommand);
program.addCommand(recommendCommand);
program.addCommand(benchmarkCommand);
program.addCommand(optimizeCommand);

program.parse();
