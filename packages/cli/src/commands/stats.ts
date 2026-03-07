import { Command } from 'commander';
import chalk from 'chalk';
import { PrismaClient } from '@agentfoundry/db';

const prisma = new PrismaClient();

export const statsCommand = new Command()
    .name('stats')
    .description('Show basic stats for tracked agent sessions')
    .action(async () => {
        console.log(chalk.cyan('\\n📊 AgentFoundry V2 Statistics\\n'));

        try {
            const totalSessions = await prisma.agentSession.count();
            const sessions = await prisma.agentSession.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { gitSnapshot: true }
            });

            console.log(chalk.white(`Total Tracked Sessions: ${chalk.green(totalSessions)}\\n`));

            console.log(chalk.yellow('Recent Sessions:'));
            sessions.forEach(s => {
                console.log(`- ${chalk.cyan(s.agentName)} | ${s.durationSeconds}s | ${s.startedAt.toLocaleString()}`);
            });

        } catch (err) {
            console.log(chalk.red('Failed to connect to local SQLite tracker Database. Run db:push first.'));
        }

        process.exit(0);
    });
