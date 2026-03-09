import { Command } from 'commander';
import chalk from 'chalk';
import { PrismaClient } from '@agentfoundry/db';
import { RecommendationService } from '../services/RecommendationService';

const prisma = new PrismaClient();
const recommendationService = new RecommendationService(prisma);

export const recommendCommand = new Command('recommend')
    .description('Get agent recommendations based on historical performance')
    .option('-t, --task <type>', 'Specify task type (e.g., frontend, backend, refactor, test)')
    .option('--team <id>', 'Filter by Team ID')
    .option('--user <id>', 'Filter by User ID')
    .action(async (options) => {
        try {
            console.log(chalk.blue(`[Recommendation] Analyzing historical performance data...`));
            
            const recommendations = await recommendationService.getRecommendations({
                taskType: options.task,
                teamId: options.team,
                userId: options.user
            });

            if (recommendations.length === 0) {
                console.log(chalk.yellow('No historical data found to make a recommendation.'));
                console.log(chalk.gray('Run some agent sessions with quality checks enabled first.'));
                return;
            }

            console.log(chalk.bold(`\nTop Recommended Agents ${options.task ? `for ${options.task}` : 'Overall'}:`));
            if (options.team) console.log(chalk.cyan(`   Filtering by Team: ${options.team}`));
            if (options.user) console.log(chalk.cyan(`   Filtering by User: ${options.user}`));
            console.log(chalk.gray('─'.repeat(60)));

            recommendations.forEach((rec, index) => {
                const color = index === 0 ? chalk.green : chalk.white;
                const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : '  '));
                
                console.log(`${medal} ${color(rec.agentName.padEnd(15))} | Score: ${rec.score.toFixed(2)} | Confidence: ${rec.confidence.toUpperCase()}`);
                console.log(chalk.gray(`   Pass Rate: ${rec.metrics.passRate.toFixed(1)}% | Avg Yield: ${rec.metrics.avgTokenYield.toFixed(2)} | Avg Cost: $${rec.metrics.avgCostUsd.toFixed(4)}`));
                console.log(chalk.gray(`   Based on ${rec.metrics.sessionCount} sessions for '${rec.taskType}'`));
                console.log('');
            });

            if (recommendations.length > 0) {
                console.log(chalk.bold.green(`\nVerdict: Use ${recommendations[0].agentName} for best results.`));
            }

        } catch (error) {
            console.error(chalk.red('Error generating recommendations:'), error);
        } finally {
            await prisma.$disconnect();
        }
    });
