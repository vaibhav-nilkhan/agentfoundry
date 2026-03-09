import { PrismaClient } from '@agentfoundry/db';
import { calculateRecommendations, AgentRecommendation } from '@agentfoundry/shared';

export class RecommendationService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Recommends the best agent for a given task type based on historical performance.
     */
    async getRecommendations(taskType?: string): Promise<AgentRecommendation[]> {
        const whereClause: any = {};
        if (taskType) {
            whereClause.taskType = taskType;
        }

        const sessions = await this.prisma.agentSession.findMany({
            where: whereClause,
            include: { quality: true, cost: true }
        });

        return calculateRecommendations(sessions, taskType);
    }
}
