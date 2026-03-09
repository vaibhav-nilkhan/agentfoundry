import { PrismaClient } from '@agentfoundry/db';
import { calculateRecommendations, AgentRecommendation } from '@agentfoundry/shared';

export class RecommendationService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Recommends the best agent for a given task type based on historical performance.
     * Support multi-tenant filtering by teamId and userId.
     */
    async getRecommendations(options: { 
        taskType?: string; 
        teamId?: string; 
        userId?: string; 
    } = {}): Promise<AgentRecommendation[]> {
        const whereClause: any = {};
        
        if (options.taskType) {
            whereClause.taskType = options.taskType;
        }
        if (options.teamId) {
            whereClause.teamId = options.teamId;
        }
        if (options.userId) {
            whereClause.userId = options.userId;
        }

        const sessions = await this.prisma.agentSession.findMany({
            where: whereClause,
            include: { quality: true, cost: true }
        });

        return calculateRecommendations(sessions, options.taskType);
    }
}
