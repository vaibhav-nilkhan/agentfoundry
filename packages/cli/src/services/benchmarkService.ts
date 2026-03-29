import { PrismaClient } from '@agentfoundry/db';
import { GitIntegration } from './gitIntegration';
import { qualityQueue } from './qualityQueue';
import { LogParserService } from './logParser';
import { TaskClassifier } from '@agentfoundry/validator';
import { spawn } from 'child_process';
import chalk from 'chalk';

const prismaInstance = new PrismaClient();
const logParserInstance = new LogParserService(prismaInstance);
const gitInstance = new GitIntegration();

export interface BenchmarkResult {
    agentName: string;
    durationSeconds: number;
    costUsd: number;
    testsPassed: number;
    testsFailed: number;
    linesAdded: number;
    success: boolean;
}

export class BenchmarkService {
    constructor(
        private readonly db: any = prismaInstance,
        private readonly logParser: any = logParserInstance,
        private readonly git: GitIntegration = gitInstance,
        private readonly qQueue: any = qualityQueue
    ) {}

    /**
     * Runs a benchmark for multiple agents on a single prompt.
     */
    public async runBenchmark(prompt: string, agents: string[]): Promise<BenchmarkResult[]> {
        const benchmarkId = `bench_${Date.now()}`;
        const results: BenchmarkResult[] = [];

        console.log(chalk.cyan(`\n📊 Starting Benchmark Run: ${benchmarkId}`));
        console.log(chalk.dim(`Task: "${prompt}"\n`));

        for (const agent of agents) {
            console.log(chalk.yellow(`\n[Agent: ${agent}] Running task...`));
            
            const startTime = new Date();
            const preRunGit = await this.git.takeSnapshot();

            try {
                // Execute the agent command
                await this.executeAgent(agent, prompt);
                
                const endTime = new Date();
                const postRunGit = await this.git.takeSnapshot();
                const delta = this.git.calculateDelta(preRunGit, postRunGit);
                const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

                console.log(chalk.dim(`[Agent: ${agent}] Running quality checks...`));
                const qualityResults = await this.qQueue.enqueue(process.cwd());

                // Save session to DB
                const dbSession = await this.db.agentSession.create({
                    data: {
                        agentName: agent,
                        taskHint: prompt,
                        benchmarkId,
                        startedAt: startTime,
                        endedAt: endTime,
                        durationSeconds,
                        taskType: TaskClassifier.classify(delta.filesChanged),
                        quality: {
                            create: {
                                testsPassed: qualityResults.testsPassed,
                                testsFailed: qualityResults.testsFailed,
                                lintIssues: qualityResults.lintIssues,
                                buildSuccess: qualityResults.buildSuccess
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

                const cost = await this.logParser.parseAndSaveCost(dbSession.id, agent as any, startTime, endTime);

                results.push({
                    agentName: agent,
                    durationSeconds,
                    costUsd: cost?.costUsd || 0,
                    testsPassed: qualityResults.testsPassed,
                    testsFailed: qualityResults.testsFailed,
                    linesAdded: delta.linesAdded,
                    success: qualityResults.buildSuccess && qualityResults.testsFailed === 0
                });

                console.log(chalk.green(`[Agent: ${agent}] Done. Result saved.`));

            } catch (error) {
                console.error(chalk.red(`[Agent: ${agent}] Failed: ${error}`));
            } finally {
                // IMPORTANT: Reset the working directory for the next agent
                console.log(chalk.dim(`[Agent: ${agent}] Resetting workspace for next run...`));
                await this.git.resetToCleanState();
            }
        }

        return results;
    }

    private async executeAgent(agent: string, prompt: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Simplified execution: assumes agent is a global command that accepts a prompt
            // Real implementation would handle claude-code login, codex specific CLI flags, etc.
            const child = spawn(agent, [prompt], {
                stdio: 'inherit',
                shell: true
            });

            child.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Agent exited with code ${code}`));
            });

            child.on('error', (err) => {
                reject(err);
            });
        });
    }
}

export const benchmarkService = new BenchmarkService();
