import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { PrismaClient } from '@agentfoundry/db';
import { ReportsService } from '../services/reports.service';

const prisma = new PrismaClient();
const reportsService = new ReportsService(prisma);

export const historyCommand = new Command()
    .name('history')
    .description('Show recent agent sessions log')
    .option('-l, --limit <number>', 'Number of sessions to show', '10')
    .option('-a, --agent <name>', 'Filter by agent name')
    .option('--team <id>', 'Filter by Team ID')
    .option('--user <id>', 'Filter by User ID')
    .action(async (options) => {
        try {
            const limit = parseInt(options.limit, 10);
            const history = await reportsService.getHistory(limit, {
                agentName: options.agent,
                teamId: options.team,
                userId: options.user
            });

            console.log(chalk.cyan(`\n📜 Recent Agent Sessions\n`));

            const table = new Table({
                head: [
                    chalk.white('Date'),
                    chalk.white('Agent'),
                    chalk.white('Task Type'),
                    chalk.white('Time'),
                    chalk.white('Cost'),
                    chalk.white('Diff')
                ],
            });

            for (const session of history) {
                const dateStr = session.startedAt.toLocaleString();
                const agent = chalk.green(session.agentName);
                const taskType = session.taskType || 'unknown';
                const timeStr = `${session.durationSeconds || 0}s`;
                const costStr = session.cost ? `$${session.cost.costUsd.toFixed(4)}` : 'N/A';

                let diffStr = 'N/A';
                if (session.gitSnapshot) {
                    diffStr = `+${session.gitSnapshot.linesAdded} -${session.gitSnapshot.linesRemoved}`;
                }

                table.push([dateStr, agent, taskType, timeStr, costStr, diffStr]);
            }

            console.log(table.toString());
            console.log('');
        } catch (err) {
            console.error(chalk.red('Failed to fetch history. Ensure local tracking database exists.'));
        }
        process.exit(0);
    });
