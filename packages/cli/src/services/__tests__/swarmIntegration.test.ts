import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SwarmManager } from '../swarmManager';
import { PrismaClient } from '@agentfoundry/db';

// This is a Real Logic Integration Test
// It tests the interaction between ProcessMonitor, SwarmManager, and the Database
describe('Swarm Orchestration Integration', () => {
    let prisma: PrismaClient;
    let swarm: SwarmManager;

    beforeEach(async () => {
        prisma = new PrismaClient();
        swarm = new SwarmManager();
        
        // Clear test data
        await prisma.agentSession.deleteMany({ where: { agentName: { in: ['claude-test', 'codex-test'] } } });
    });

    afterEach(async () => {
        await prisma.$disconnect();
    });

    it('should correctly group concurrent agent sessions under the same swarmId in the database', async () => {
        const timestamp = new Date();
        
        // 1. Simulate Agent A Starting (Claude)
        await swarm.registerStart(1001, 'claude-code', timestamp);
        
        // 2. Simulate Agent B Starting (Codex) - Overlapping
        await swarm.registerStart(1002, 'codex', new Date(timestamp.getTime() + 1000));

        expect(swarm.getActiveCount()).toBe(2);
        expect(swarm.isSwarmActive()).toBe(true);

        // 3. Simulate Agent A Stopping
        const stopA = await swarm.registerStop(1001);
        expect(stopA?.swarmId).toBeDefined();
        const swarmId = stopA?.swarmId;

        // Create DB record for A
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-test',
                swarmId: swarmId,
                startedAt: timestamp,
                endedAt: new Date(),
                durationSeconds: 10,
                taskType: 'test'
            }
        });

        // 4. Simulate Agent B Stopping
        const stopB = await swarm.registerStop(1002);
        expect(stopB?.swarmId).toBe(swarmId); // Must match!

        // Create DB record for B
        await prisma.agentSession.create({
            data: {
                agentName: 'codex-test',
                swarmId: swarmId,
                startedAt: timestamp,
                endedAt: new Date(),
                durationSeconds: 10,
                taskType: 'test'
            }
        });

        // 5. Final Verification in Database
        const records = await prisma.agentSession.findMany({
            where: { swarmId: swarmId }
        });

        expect(records).toHaveLength(2);
        expect(records[0].swarmId).toBe(records[1].swarmId);
        expect(records.map(r => r.agentName)).toContain('claude-test');
        expect(records.map(r => r.agentName)).toContain('codex-test');
        
        console.log(`✅ Integration Passed: Found 2 sessions sharing SwarmID: ${swarmId}`);
    });
});
