import { PrismaClient } from '@agentfoundry/db';
import { calculateTokenCost } from './pricingConfig';
import { AgentType } from './processMonitor';
import { getParserForAgent, ParsedSessionCost } from './logParsers';

/**
 * Main service to coordinate log parsing and database persistence.
 * Delegates actual parsing logic to specific agent adapters in ./logParsers.
 */
export class LogParserService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Main entry point: parse logs for an agent session and save the cost record.
     */
    public async parseAndSaveCost(
        sessionId: string,
        agentName: AgentType,
        startedAt: Date,
        endedAt: Date
    ): Promise<ParsedSessionCost | null> {
        try {
            const parser = getParserForAgent(agentName);
            if (!parser) {
                return null;
            }

            const usage = parser.parseLogs(startedAt, endedAt);
            if (!usage) {
                return null;
            }

            const totalIn = usage.inputTokens + usage.cacheCreationTokens + usage.cacheReadTokens;
            const totalOut = usage.outputTokens;
            const costUsd = calculateTokenCost(agentName, totalIn, totalOut, usage.model, usage.breakdown);

            const result: ParsedSessionCost = {
                tokensIn: totalIn,
                tokensOut: totalOut,
                costUsd,
                model: usage.model,
                breakdown: usage.breakdown
            };

            await this.saveCostRecord(sessionId, result);
            return result;

        } catch (error) {
            console.error(`[LogParser] Failed to parse logs for ${agentName}:`, error);
            return null;
        }
    }

    /**
     * Saves the parsed cost data to the CostRecord table via Prisma.
     */
    private async saveCostRecord(sessionId: string, cost: ParsedSessionCost): Promise<void> {
        await this.prisma.costRecord.create({
            data: {
                sessionId,
                tokensIn: cost.tokensIn,
                tokensOut: cost.tokensOut,
                costUsd: cost.costUsd,
                modelName: cost.model,
                breakdown: cost.breakdown ? JSON.stringify(cost.breakdown) : null
            }
        });
    }
}

export * from './logParsers/types';
