import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { PrismaClient } from '@agentfoundry/db';
import { ReportsService } from '../services/reports.service';

const prisma = new PrismaClient();
const reportsService = new ReportsService(prisma);

export const costsCommand = new Command()
    .name('costs')
    .description('Show breakdown of API costs by agent')
    .option('-p, --period <period>', 'Filter by period (day, week, month)')
    .action(async (options) => {
        try {
            const { breakdown, totalCost } = await reportsService.getCostBreakdown(options.period);

            console.log(chalk.cyan(`\n💸 API Cost Breakdown ${options.period ? '(' + options.period + ')' : ''}\n`));

            const table = new Table({
                head: [chalk.white('Agent'), chalk.white('Cost (USD)')],
            });

            for (const [agentName, cost] of Object.entries(breakdown)) {
                table.push([agentName, `$${cost.toFixed(4)}`]);
            }

            table.push([chalk.bold('Total'), chalk.bold.red(`$${totalCost.toFixed(4)}`)]);

            console.log(table.toString());
            console.log('');
        } catch (err) {
            console.error(chalk.red('Failed to fetch costs. Ensure local tracking database exists.'));
        }
        process.exit(0);
    });
