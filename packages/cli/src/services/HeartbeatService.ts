import { PrismaClient } from '@agentfoundry/db';
import { SwarmManager, SwarmSession } from './swarmManager';
import { LogParserService } from './logParser';
import { GitIntegration } from './gitIntegration';
import { EfficiencyCalculator, TaskClassifier } from '@agentfoundry/validator';
import chalk from 'chalk';

export class HeartbeatService {
    private prisma: PrismaClient;
    private swarm: SwarmManager;
    private logParser: LogParserService;
    private git: GitIntegration;
    private activeSessionIds: Map<number, string> = new Map();

    constructor(prisma: PrismaClient, swarm: SwarmManager, logParser: LogParserService) {
        this.prisma = prisma;
        this.swarm = swarm;
        this.logParser = logParser;
        this.git = new GitIntegration();
    }

    /**
     * Registers a DB session ID for a PID so the heartbeat knows which row to update.
     */
    public registerSessionMapping(pid: number, sessionId: string) {
        this.activeSessionIds.set(pid, sessionId);
    }

    public removeSessionMapping(pid: number) {
        this.activeSessionIds.delete(pid);
    }

    /**
     * Periodically runs for all active agents.
     * Captures current Git diff and current Log tokens without closing the session.
     */
    public async processActiveSessions() {
        const activeSessions = this.swarm.getActiveSessions();
        if (activeSessions.size === 0) return;

        for (const [pid, session] of activeSessions.entries()) {
            const sessionId = this.activeSessionIds.get(pid);
            if (!sessionId) continue;

            try {
                // 1. Capture current Git Delta (relative to start)
                const currentSnapshot = await this.git.takeSnapshot();
                const delta = this.git.calculateDelta(session.startSnapshot, currentSnapshot);
                const taskType = TaskClassifier.classify(delta.filesChanged);

                // 2. Parse current logs (idempotent via upsert)
                const cost = await this.logParser.parseAndSaveCost(
                    sessionId,
                    session.agent,
                    session.startTime,
                    new Date() // Current progress
                );

                // 3. Update Quality/Efficiency metrics so far
                if (cost) {
                    const tokenYield = EfficiencyCalculator.calculateTokenYield(cost.tokensOut, delta.linesAdded, delta.linesRemoved);
                    
                    await this.prisma.agentSession.update({
                        where: { id: sessionId },
                        data: {
                            taskType,
                            updatedAt: new Date(),
                            quality: {
                                update: {
                                    tokenYield
                                }
                            },
                            gitSnapshot: {
                                upsert: {
                                    update: {
                                        filesChanged: JSON.stringify(delta.filesChanged),
                                        linesAdded: delta.linesAdded,
                                        linesRemoved: delta.linesRemoved
                                    },
                                    create: {
                                        filesChanged: JSON.stringify(delta.filesChanged),
                                        linesAdded: delta.linesAdded,
                                        linesRemoved: delta.linesRemoved
                                    }
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error(chalk.yellow(`[HEARTBEAT] Failed to update session ${pid}:`), error);
            }
        }
    }
}
