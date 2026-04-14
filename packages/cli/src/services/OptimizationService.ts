import { PrismaClient } from '@agentfoundry/db';
import * as fs from 'fs';
import * as path from 'path';

export class OptimizationService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Analyzes historical metrics and generates prompt optimization rules.
     * Updates tasks/lessons.md and wires all agent files to point to it.
     */
    async applyOptimizations(workspacePath: string): Promise<string[]> {
        const rules = await this.generateRules();
        if (rules.length === 0) {
            return [];
        }

        this.updateLessonsFile(workspacePath, rules);
        this.wireAgentFiles(workspacePath);

        return rules;
    }

    private async generateRules(): Promise<string[]> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSessions = await this.prisma.agentSession.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            include: { quality: true }
        });

        const historicalSessions = await this.prisma.agentSession.findMany({
            where: { createdAt: { lt: sevenDaysAgo } },
            include: { quality: true }
        });

        const rules: string[] = [];

        // 1. Task-Specific Heuristics (All Time)
        const allSessions = [...recentSessions, ...historicalSessions];
        const taskTypes = [...new Set(allSessions.map(s => s.taskType).filter(t => t))];

        for (const taskType of taskTypes) {
            if (!taskType) continue;
            const taskSessions = allSessions.filter(s => s.taskType === taskType && s.quality);
            if (taskSessions.length < 3) continue; // Need minimum data

            const zeroShotCount = taskSessions.filter(s => s.quality?.isZeroShot).length;
            const zeroShotRate = (zeroShotCount / taskSessions.length) * 100;

            const yieldSessions = taskSessions.filter(s => s.quality?.tokenYield != null);
            const avgYield = yieldSessions.length > 0 
                ? yieldSessions.reduce((acc, s) => acc + (s.quality!.tokenYield!), 0) / yieldSessions.length 
                : 0;

            if (zeroShotRate < 50) {
                rules.push(`🚨 **[${taskType}] Tasks:** Agents historically struggle with zero-shot success (${zeroShotRate.toFixed(1)}%). **Rule:** Always ask the user to verify approach and test extensively before finalizing execution.`);
            }
            if (avgYield > 1.5) {
                rules.push(`🚨 **[${taskType}] Tasks:** High token yield (${avgYield.toFixed(2)}) indicates thrashing. **Rule:** Do not guess setups. Read the existing context and configuration closely before writing code.`);
            }
        }

        // 2. Agent Degradation (Trend Analysis)
        const agentNames = [...new Set(allSessions.map(s => s.agentName))];
        for (const agent of agentNames) {
            const agentRecent = recentSessions.filter(s => s.agentName === agent && s.quality);
            const agentHist = historicalSessions.filter(s => s.agentName === agent && s.quality);

            if (agentRecent.length < 3 || agentHist.length < 3) continue;

            const recentYieldSessions = agentRecent.filter(s => s.quality?.tokenYield != null);
            const histYieldSessions = agentHist.filter(s => s.quality?.tokenYield != null);

            if (recentYieldSessions.length > 0 && histYieldSessions.length > 0) {
                const recentYield = recentYieldSessions.reduce((a, s) => a + s.quality!.tokenYield!, 0) / recentYieldSessions.length;
                const histYield = histYieldSessions.reduce((a, s) => a + s.quality!.tokenYield!, 0) / histYieldSessions.length;

                if (recentYield > histYield * 1.2) {
                    rules.push(`⚠️ **[${agent}] Degradation Detected:** Recent sessions show a spike in token usage (thrashing). **Rule:** Provide concise outputs, read file contents explicitly, and break tasks down to avoid context exhaustion and hallucinations.`);
                }
            }

            const recentZS = agentRecent.filter(s => s.quality?.isZeroShot).length / agentRecent.length;
            const histZS = agentHist.filter(s => s.quality?.isZeroShot).length / agentHist.length;

            if (recentZS < histZS * 0.8 && recentZS < 0.6) {
                rules.push(`⚠️ **[${agent}] Quality Drop Detected:** Zero-shot success rate has dropped recently. **Rule:** Enforce stricter verification and run all tests immediately after any code changes.`);
            }
        }

        // Deduplicate rules
        return [...new Set(rules)];
    }

    private updateLessonsFile(workspacePath: string, rules: string[]) {
        const tasksDir = path.join(workspacePath, 'tasks');
        if (!fs.existsSync(tasksDir)) {
            fs.mkdirSync(tasksDir, { recursive: true });
        }
        
        const lessonsFile = path.join(tasksDir, 'lessons.md');
        let content = fs.existsSync(lessonsFile) ? fs.readFileSync(lessonsFile, 'utf-8') : '# Lessons Wiki\n\nTrack learnings and self-improvement here.\n\n';

        const optimizationsBlock = `\n## 🤖 AgentFoundry Auto-Optimizations\n_Generated automatically based on session metrics._\n\n${rules.map(r => `- ${r}`).join('\n')}\n`;

        const regex = /\n## 🤖 AgentFoundry Auto-Optimizations[\s\S]*?(?=\n## |$)/;
        if (regex.test(content)) {
            content = content.replace(regex, optimizationsBlock);
        } else {
            content += optimizationsBlock;
        }

        fs.writeFileSync(lessonsFile, content, 'utf-8');
    }

    private wireAgentFiles(workspacePath: string) {
        const agentFiles = ['CLAUDE.md', 'GEMINI.md', 'AGENT_INSTRUCTIONS.md', '.cursorrules'];
        const pointerLine = '> **CRITICAL**: Before starting any task, you MUST read tasks/lessons.md for auto-generated optimization rules.\n';

        for (const file of agentFiles) {
            const filePath = path.join(workspacePath, file);
            if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf-8');
                if (!content.includes('read tasks/lessons.md for auto-generated optimization rules')) {
                    content = pointerLine + '\n' + content;
                    fs.writeFileSync(filePath, content, 'utf-8');
                }
            }
        }
    }
}
