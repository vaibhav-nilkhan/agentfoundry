import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ProcessMonitor, ProcessEvent } from '../services/processMonitor';
import { GitIntegration, GitSnapshotData } from '../services/gitIntegration';
import { PrismaClient } from '@agentfoundry/db';

const prisma = new PrismaClient();
const activeSessions = new Map<number, { startTime: Date, preRunGit: GitSnapshotData }>();

export const watchCommand = new Command()
    .name('watch')
    .description('Run background daemon to monitor local Agent usage (Claude, Codex, etc.)')
    .action(async () => {
        console.log(chalk.cyan('Starting AgentFoundry Watch Daemon...'));
        const spinner = ora('Initializing process monitor and git integration...').start();

        const git = new GitIntegration();

        const monitor = new ProcessMonitor(async (event: ProcessEvent) => {
            if (event.type === 'start') {
                spinner.text = `Started tracking Agent: ${chalk.green(event.agent)} (PID: ${event.pid})`;

                // Take pre-run snapshot safely
                const preRunGit = await git.takeSnapshot();
                activeSessions.set(event.pid, { startTime: event.timestamp, preRunGit });

            } else if (event.type === 'stop') {
                const sessionData = activeSessions.get(event.pid);
                if (!sessionData) return;

                spinner.text = `Agent stopped: ${chalk.yellow(event.agent)} (PID: ${event.pid}). Processing results...`;
                const durationSeconds = Math.round((event.timestamp.getTime() - sessionData.startTime.getTime()) / 1000);

                // Take post-run snapshot safely
                const postRunGit = await git.takeSnapshot();
                const gitDelta = git.calculateDelta(sessionData.preRunGit, postRunGit);

                try {
                    // Save to SQLite via Prisma
                    await prisma.agentSession.create({
                        data: {
                            agentName: event.agent,
                            taskHint: event.cmdHint,
                            startedAt: sessionData.startTime,
                            endedAt: event.timestamp,
                            durationSeconds,
                            gitSnapshot: {
                                create: {
                                    filesChanged: JSON.stringify(gitDelta.filesChanged),
                                    linesAdded: gitDelta.linesAdded,
                                    linesRemoved: gitDelta.linesRemoved
                                }
                            }
                        }
                    });
                    spinner.succeed(`Saved session: ${chalk.green(event.agent)} (${durationSeconds}s). Files changed: ${gitDelta.filesChanged.length}.`);
                } catch (error) {
                    spinner.fail(`Failed to save session for ${event.agent}: ${error}`);
                }

                activeSessions.delete(event.pid);
                spinner.start('Waiting for agents...');
            }
        });

        await monitor.start(2000);
        spinner.succeed('Daemon is running in the background. Close terminal to exit.');

        // Keep alive
        setInterval(() => { }, 1000 * 60 * 60);
    });
