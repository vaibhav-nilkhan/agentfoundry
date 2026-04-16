import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ProcessMonitor, ProcessEvent } from '../services/processMonitor';
import { SwarmManager } from '../services/swarmManager';
import { qualityQueue } from '../services/qualityQueue';
import { LogParserService } from '../services/logParser';
import { PrismaClient } from '@agentfoundry/db';
import { TaskClassifier, EfficiencyCalculator } from '@agentfoundry/validator';
import { OptimizationService } from '../services/OptimizationService';
import { HeartbeatService } from '../services/HeartbeatService';

const prisma = new PrismaClient();
const logParser = new LogParserService(prisma);
const swarm = new SwarmManager();
const optimizationService = new OptimizationService(prisma);
const heartbeatService = new HeartbeatService(prisma, swarm, logParser);

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
                
                // Immediately create the ACTIVE session in DB to anchor it
                const dbSession = await prisma.agentSession.create({
                    data: {
                        agentName: event.agent,
                        taskHint: event.cmdHint,
                        status: 'ACTIVE',
                        startedAt: event.timestamp,
                        quality: { create: {} },
                        gitSnapshot: { create: { filesChanged: '[]' } }
                    }
                });

                heartbeatService.registerSessionMapping(event.pid, dbSession.id);
                
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

        // HEARTBEAT: Every 15 minutes, update active sessions with current progress
        setInterval(async () => {
            if (swarm.getActiveCount() > 0) {
                await heartbeatService.processActiveSessions();
            }
        }, 1000 * 60 * 15);

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

        // Update the existing session to COMPLETED
        const dbSessionId = (heartbeatService as any).activeSessionIds.get(event.pid);
        
        const dbSession = await prisma.agentSession.update({
            where: { id: dbSessionId },
            data: {
                status: 'COMPLETED',
                endedAt: event.timestamp,
                durationSeconds,
                taskType,
                swarmId,
                quality: {
                    update: {
                        testsPassed: qualityResults.testsPassed,
                        testsFailed: qualityResults.testsFailed,
                        lintIssues: qualityResults.lintIssues,
                        buildSuccess: qualityResults.buildSuccess,
                        isZeroShot: isZeroShot
                    }
                },
                gitSnapshot: {
                    update: {
                        filesChanged: JSON.stringify(delta.filesChanged),
                        linesAdded: delta.linesAdded,
                        linesRemoved: delta.linesRemoved
                    }
                }
            }
        });

        heartbeatService.removeSessionMapping(event.pid);

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

            // Trigger Prompt Optimization if session was inefficient
            if (tokenYield > 1.5 || !isZeroShot) {
                console.log(chalk.blue(`[OPTIMIZE] `) + chalk.dim(`Analyzing metrics to update tasks/lessons.md...`));
                try {
                    await optimizationService.applyOptimizations(process.cwd());
                } catch (optErr) {
                    console.error(chalk.yellow(`[WARN] Failed to auto-optimize: ${optErr}`));
                }
            }
        } else {
            console.log(chalk.green(`[SAVED] `) + chalk.white(`${event.agent}: `) + chalk.dim(`${delta.filesChanged.length} files. (No cost data)`));
            
            // Trigger Prompt Optimization if session failed zero-shot
            if (!isZeroShot) {
                console.log(chalk.blue(`[OPTIMIZE] `) + chalk.dim(`Analyzing metrics to update tasks/lessons.md...`));
                try {
                    await optimizationService.applyOptimizations(process.cwd());
                } catch (optErr) {
                    console.error(chalk.yellow(`[WARN] Failed to auto-optimize: ${optErr}`));
                }
            }
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