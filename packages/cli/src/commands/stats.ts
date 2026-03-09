import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { PrismaClient } from '@agentfoundry/db';
import { ReportsService } from '../services/reports.service';

const prisma = new PrismaClient();
const reportsService = new ReportsService(prisma);

export const statsCommand = new Command()
    .name('stats')
    .description('Show overall agent usage statistics')
    .option('-a, --agent <name>', 'Filter by agent name')
    .option('-p, --period <period>', 'Filter by period (day, week, month)')
    .action(async (options) => {
        try {
            const stats = await reportsService.getOverallStats(options.agent, options.period);

            console.log(chalk.cyan(`\n📊 AgentFoundry V2 Statistics ${options.period ? '(' + options.period + ')' : ''}\n`));

            const table = new Table({
                head: [chalk.white('Metric'), chalk.white('Value')],
            });

            table.push(
                ['Total Sessions Tracked', chalk.green(stats.totalSessions.toString())],
                ['Average Session Duration', chalk.yellow(`${stats.avgDuration.toFixed(1)}s`)],
                ['Total Input Tokens', stats.totalTokensIn.toLocaleString()],
                ['Total Output Tokens', stats.totalTokensOut.toLocaleString()],
                ['Total Cost (USD)', chalk.red(`$${stats.totalCostUsd.toFixed(4)}`)],
                ['Test Pass Rate', chalk.blue(`${stats.passRate.toFixed(1)}%`)],
                ['Zero-Shot Success Rate', chalk.magenta(`${stats.zeroShotRate.toFixed(1)}%`)],
                ['Avg Token Yield (lower is better)', chalk.magenta(stats.avgTokenYield.toFixed(2))]
            );

            console.log(table.toString());
            console.log('');
        } catch (err) {
            console.error(chalk.red('Failed to fetch stats. Ensure local tracking database exists.'));
        }
        process.exit(0);
    });
