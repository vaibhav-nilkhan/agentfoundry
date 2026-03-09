export interface AgentRecommendation {
    agentName: string;
    taskType: string;
    score: number;
    metrics: {
        passRate: number;
        avgTokenYield: number;
        avgCostUsd: number;
        sessionCount: number;
    };
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Shared logic to calculate recommendations from a list of sessions.
 * Decoupled from Prisma to be usable in both CLI and Web.
 */
export function calculateRecommendations(sessions: any[], targetTaskType?: string): AgentRecommendation[] {
    if (!sessions || sessions.length === 0) {
        return [];
    }

    const filteredSessions = targetTaskType 
        ? sessions.filter(s => s.taskType === targetTaskType)
        : sessions;

    if (filteredSessions.length === 0) return [];

    // Group sessions by agentName and taskType
    const groupings: Record<string, any[]> = {};
    for (const session of filteredSessions) {
        const key = `${session.agentName}|${session.taskType || 'general'}`;
        if (!groupings[key]) groupings[key] = [];
        groupings[key].push(session);
    }

    const recommendations: AgentRecommendation[] = [];

    for (const [key, groupSessions] of Object.entries(groupings)) {
        const [agentName, tType] = key.split('|');
        
        const sessionsWithQuality = groupSessions.filter(s => s.quality);
        const totalTestsPassed = sessionsWithQuality.reduce((sum, s) => sum + (s.quality?.testsPassed || 0), 0);
        const totalTestsFailed = sessionsWithQuality.reduce((sum, s) => sum + (s.quality?.testsFailed || 0), 0);
        
        let passRate = 0;
        if (totalTestsPassed + totalTestsFailed > 0) {
            passRate = (totalTestsPassed / (totalTestsPassed + totalTestsFailed)) * 100;
        }

        const sessionsWithYield = sessionsWithQuality.filter(s => s.quality?.tokenYield != null);
        const avgTokenYield = sessionsWithYield.length > 0
            ? sessionsWithYield.reduce((sum, s) => sum + (s.quality!.tokenYield!), 0) / sessionsWithYield.length
            : 0;

        const totalCostUsd = groupSessions.reduce((sum, s) => sum + (s.cost?.costUsd || 0), 0);
        const avgCostUsd = totalCostUsd / groupSessions.length;

        // Weighted score logic
        const passRateWeight = 0.5;
        const yieldWeight = 0.3;
        const costWeight = 0.2;

        const yieldScore = avgTokenYield > 0 ? (1 / Math.max(1, avgTokenYield)) : 0.5;
        const costScore = avgCostUsd > 0 ? (0.01 / Math.max(0.001, avgCostUsd)) : 0.5;

        const finalScore = (passRate / 100 * passRateWeight) + (yieldScore * yieldWeight) + (costScore * costWeight);

        let confidence: 'high' | 'medium' | 'low' = 'low';
        if (groupSessions.length >= 10) confidence = 'high';
        else if (groupSessions.length >= 3) confidence = 'medium';

        recommendations.push({
            agentName,
            taskType: tType,
            score: finalScore,
            metrics: {
                passRate,
                avgTokenYield,
                avgCostUsd,
                sessionCount: groupSessions.length
            },
            confidence
        });
    }

    return recommendations.sort((a, b) => b.score - a.score);
}
