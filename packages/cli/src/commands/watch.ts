import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ProcessMonitor, ProcessEvent } from '../services/processMonitor';
import { SwarmManager } from '../services/swarmManager';
import { qualityQueue } from '../services/qualityQueue';
import { LogParserService } from '../services/logParser';
import { PrismaClient } from '@agentfoundry/db';
import { TaskClassifier, EfficiencyCalculator } from '@agentfoundry/validator';

const prisma = new PrismaClient();
const logParser = new LogParserService(prisma);
const swarm = new SwarmManager();

export const watchCommand = new Command()
    .name('watch')
    .description('Run background daemon to monitor local Agent usage (Claude, Codex, etc.)')
    .action(async () => {
        console.log(chalk.cyan('\n🚀 AgentFoundry Swarm Watcher Active'));
        console.log(chalk.dim('Monitoring for Claude, Codex, Gemini, and Amp...\n'));
        
        const mainSpinner = ora('Waiting for agents...').start();

        const monitor = new ProcessMonitor(async (event: ProcessEvent) => {
            if (event.type === 'start') {
                await swarm.registerStart(event.pid, event.agent, event.timestamp);
                
                const activeCount = swarm.getActiveCount();
                mainSpinner.stop();
                
                console.log(chalk.green(`[START] `) + chalk.white(`${event.agent} `) + chalk.dim(`(PID: ${event.pid})`));
                
                if (activeCount > 1) {
                    console.log(chalk.yellow(`[SWARM] Concurrent activity detected! (${activeCount} agents active)`));
                }
                
                mainSpinner.start(`Tracking ${chalk.green(activeCount)} active agent(s)...`);

            } else if (event.type === 'stop') {
                // Process the stop event asynchronously
                processSessionEnd(event, mainSpinner);
            }
        });

        await monitor.start(2000);

        // Keep alive
        setInterval(() => { }, 1000 * 60 * 60);
    });

async function processSessionEnd(event: ProcessEvent, mainSpinner: any) {
    const result = await swarm.registerStop(event.pid);
    if (!result) return;

    const { delta, session, swarmId } = result;
    const durationSeconds = Math.round((event.timestamp.getTime() - session.startTime.getTime()) / 1000);
    const activeCount = swarm.getActiveCount();

    // Stop main spinner during log output to prevent flickering
    mainSpinner.stop();
    console.log(chalk.yellow(`[STOP]  `) + chalk.white(`${event.agent} `) + chalk.dim(`(PID: ${event.pid}) after ${durationSeconds}s`));
    
    if (activeCount > 0) {
        mainSpinner.start(`Tracking ${chalk.green(activeCount)} active agent(s)...`);
    } else {
        mainSpinner.start('Finalizing processing...');
    }

    try {
        const taskType = TaskClassifier.classify(delta.filesChanged);
        
        // Enqueue quality checks to prevent concurrent build/test collisions
        console.log(chalk.blue(`[QUEUE] `) + chalk.dim(`Quality checks for ${event.agent}...`));
        const qualityResults = await qualityQueue.enqueue(process.cwd());

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentFailures = await prisma.agentSession.count({
            where: {
                agentName: event.agent,
                taskType: taskType,
                startedAt: { gte: oneHourAgo },
                quality: {
                    OR: [
                        { testsFailed: { gt: 0 } },
                        { buildSuccess: false }
                    ]
                }
            }
        });
        const isZeroShot = EfficiencyCalculator.calculateIsZeroShot(qualityResults, recentFailures);

        // Save to SQLite via Prisma
        const dbSession = await prisma.agentSession.create({
            data: {
                agentName: event.agent,
                taskHint: event.cmdHint || session.agent,
                swarmId,
                startedAt: session.startTime,
                endedAt: event.timestamp,
                durationSeconds,
                taskType,
                quality: {
                    create: {
                        testsPassed: qualityResults.testsPassed,
                        testsFailed: qualityResults.testsFailed,
                        lintIssues: qualityResults.lintIssues,
                        buildSuccess: qualityResults.buildSuccess,
                        isZeroShot: isZeroShot
                    }
                },
                gitSnapshot: {
                    create: {
                        filesChanged: JSON.stringify(delta.filesChanged),
                        linesAdded: delta.linesAdded,
                        linesRemoved: delta.linesRemoved
                    }
                }
            }
        });

        const cost = await logParser.parseAndSaveCost(
            dbSession.id,
            event.agent,
            session.startTime,
            event.timestamp
        );

        mainSpinner.stop();
        if (cost) {
            const tokenYield = EfficiencyCalculator.calculateTokenYield(cost.tokensOut, delta.linesAdded, delta.linesRemoved);
            await prisma.qualityMetrics.update({
                where: { sessionId: dbSession.id },
                data: { tokenYield }
            });

            console.log(chalk.green(`[SAVED] `) + chalk.white(`${event.agent}: `) + 
                chalk.dim(`${delta.filesChanged.length} files | $${cost.costUsd.toFixed(4)} | Yield: ${tokenYield}`));
        } else {
            console.log(chalk.green(`[SAVED] `) + chalk.white(`${event.agent}: `) + chalk.dim(`${delta.filesChanged.length} files. (No cost data)`));
        }
    } catch (error) {
        console.log(chalk.red(`[ERROR] `) + chalk.white(`${event.agent}: `) + chalk.red(error));
    }

    if (swarm.getActiveCount() === 0) {
        mainSpinner.text = 'Waiting for agents...';
        mainSpinner.start();
    } else {
        mainSpinner.start(`Tracking ${chalk.green(swarm.getActiveCount())} active agent(s)...`);
    }
}

