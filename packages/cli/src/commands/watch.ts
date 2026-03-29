import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ProcessMonitor, ProcessEvent } from '../services/processMonitor';
import { SwarmManager } from '../services/swarmManager';
import { LogParserService } from '../services/logParser';
import { PrismaClient } from '@agentfoundry/db';
import { TaskClassifier, QualityChecker, EfficiencyCalculator } from '@agentfoundry/validator';

const prisma = new PrismaClient();
const logParser = new LogParserService(prisma);
const swarm = new SwarmManager();

export const watchCommand = new Command()
    .name('watch')
    .description('Run background daemon to monitor local Agent usage (Claude, Codex, etc.)')
    .action(async () => {
        console.log(chalk.cyan('Starting AgentFoundry Swarm Watcher...'));
        const mainSpinner = ora('Waiting for agents...').start();

        const monitor = new ProcessMonitor(async (event: ProcessEvent) => {
            if (event.type === 'start') {
                await swarm.registerStart(event.pid, event.agent, event.timestamp);
                
                const activeCount = swarm.getActiveCount();
                mainSpinner.text = `Tracking ${chalk.green(activeCount)} active agent(s). Last started: ${chalk.green(event.agent)} (PID: ${event.pid})`;
                
                if (activeCount > 1) {
                    console.log(chalk.yellow(`\n[Swarm] Concurrent session detected: ${event.agent} joined the swarm.`));
                }

            } else if (event.type === 'stop') {
                // Process the stop event asynchronously to avoid blocking the monitor
                processSessionEnd(event, mainSpinner);
            }
        });

        await monitor.start(2000);
        mainSpinner.succeed('Daemon is running in the background. Close terminal to exit.');
        mainSpinner.start('Waiting for agents...');

        // Keep alive
        setInterval(() => { }, 1000 * 60 * 60);
    });

async function processSessionEnd(event: ProcessEvent, mainSpinner: any) {
    const result = await swarm.registerStop(event.pid);
    if (!result) return;

    const { delta, session, swarmId } = result;
    const durationSeconds = Math.round((event.timestamp.getTime() - session.startTime.getTime()) / 1000);
    
    const sessionSpinner = ora(`Processing ${chalk.yellow(event.agent)} (PID: ${event.pid})...`).start();

    try {
        const taskType = TaskClassifier.classify(delta.filesChanged);
        
        sessionSpinner.text = `Running quality checks for ${chalk.yellow(event.agent)}...`;
        const qualityChecker = new QualityChecker(process.cwd());
        const qualityResults = await qualityChecker.runChecks();

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

        if (cost) {
            const tokenYield = EfficiencyCalculator.calculateTokenYield(cost.tokensOut, delta.linesAdded, delta.linesRemoved);
            await prisma.qualityMetrics.update({
                where: { sessionId: dbSession.id },
                data: { tokenYield }
            });

            sessionSpinner.succeed(
                `${chalk.green(event.agent)} finished (${durationSeconds}s). ` +
                `Files: ${delta.filesChanged.length} | ` +
                `Cost: $${cost.costUsd.toFixed(4)} | ` +
                `Yield: ${tokenYield}`
            );
        } else {
            sessionSpinner.succeed(`${chalk.green(event.agent)} finished (${durationSeconds}s). Files: ${delta.filesChanged.length}.`);
        }
    } catch (error) {
        sessionSpinner.fail(`Failed to save session for ${event.agent}: ${error}`);
    }

    if (swarm.getActiveCount() === 0) {
        mainSpinner.text = 'Waiting for agents...';
        mainSpinner.start();
    }
}

