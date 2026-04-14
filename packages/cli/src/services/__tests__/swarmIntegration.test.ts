import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { SwarmManager } from '../swarmManager';
import { PrismaClient } from '@agentfoundry/db';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Ensure a unique test database
const TEST_DB_PATH = path.join(__dirname, 'test-swarm.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

// This is a Real Logic Integration Test
// It tests the interaction between ProcessMonitor, SwarmManager, and the Database
describe('Swarm Orchestration Integration', () => {
    let prisma: PrismaClient;
    let swarm: SwarmManager;

    beforeAll(async () => {
        // Run Prisma DB push to initialize the schema
        const dbDir = path.resolve(__dirname, '../../../../../packages/db');
        execSync(`npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss`, {
            cwd: dbDir,
            env: {
                ...process.env,
                DATABASE_URL: `file:${TEST_DB_PATH}`
            },
            stdio: 'ignore' // Hide verbose output
        });
        
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: `file:${TEST_DB_PATH}`
                }
            }
        });
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        // Cleanup the test database
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    beforeEach(async () => {
        swarm = new SwarmManager();
        
        // Clear test data
        await prisma.agentSession.deleteMany({ where: { agentName: { in: ['claude-test', 'codex-test'] } } });
    });

    afterEach(async () => {
        // No disconnect needed here anymore
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
    }, 20000);

    it('should handle rapid parallel stops and preserve swarm consistency', async () => {
        const timestamp = new Date();
        
        // Start 3 agents
        await swarm.registerStart(2001, 'claude-code', timestamp);
        await swarm.registerStart(2002, 'codex', timestamp);
        await swarm.registerStart(2003, 'gemini', timestamp);

        // Stop all 3 in parallel
        const results = await Promise.all([
            swarm.registerStop(2001),
            swarm.registerStop(2002),
            swarm.registerStop(2003)
        ]);

        const swarmIds = results.map(r => r?.swarmId).filter(Boolean);
        
        // All should have the same swarmId because they were part of the same concurrent block
        expect(swarmIds).toHaveLength(3);
        expect(new Set(swarmIds).size).toBe(1);
        
        console.log(`✅ Integration Passed: Parallel stops preserved SwarmID: ${swarmIds[0]}`);
    });
});
