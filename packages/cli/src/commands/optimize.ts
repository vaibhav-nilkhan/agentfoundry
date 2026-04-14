import { Command } from 'commander';
import chalk from 'chalk';
import { PrismaClient } from '@agentfoundry/db';
import { OptimizationService } from '../services/OptimizationService';

const prisma = new PrismaClient();
const optimizationService = new OptimizationService(prisma);

export const optimizeCommand = new Command()
    .name('optimize')
    .description('Analyze metrics and auto-generate prompt optimization rules in tasks/lessons.md')
    .action(async () => {
        try {
            console.log(chalk.cyan(`\n🔍 Analyzing historical agent metrics for thrashing and zero-shot success...\n`));

            const workspacePath = process.cwd();
            const rules = await optimizationService.applyOptimizations(workspacePath);

            if (rules.length === 0) {
                console.log(chalk.green('✅ Agent metrics are healthy. No optimizations needed at this time.\n'));
            } else {
                console.log(chalk.yellow(`⚠️ Found ${rules.length} inefficiencies. Generated rules in tasks/lessons.md:\n`));
                rules.forEach(rule => {
                    console.log(chalk.white(`  - ${rule}`));
                });
                console.log(chalk.cyan('\n🔗 Wired existing agent instruction files to pointer.\n'));
            }
        } catch (err) {
            console.error(chalk.red('Failed to run optimizations. Ensure local tracking database exists.'));
            console.error(err);
        }
        process.exit(0);
    });
