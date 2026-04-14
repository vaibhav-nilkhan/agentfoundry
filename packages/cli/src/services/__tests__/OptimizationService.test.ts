import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@agentfoundry/db';
import { OptimizationService } from '../OptimizationService';

vi.mock('fs');

const TEST_DB_PATH = path.join(__dirname, 'test-optimization.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

describe('OptimizationService - Real DB Integration', () => {
    let service: OptimizationService;

    beforeAll(async () => {
        const schemaPath = path.resolve(__dirname, '../../../../db/prisma/schema.prisma');
        execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'ignore' });
        await prisma.$connect();
        service = new OptimizationService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    beforeEach(async () => {
        vi.clearAllMocks();
        await prisma.agentSession.deleteMany();
        
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readFileSync as any).mockReturnValue('');
        (fs.mkdirSync as any).mockImplementation(() => {});
        (fs.writeFileSync as any).mockImplementation(() => {});
    });

    it('should generate no rules if no bad metrics exist', async () => {
        // Bug this catches: Optimizations running and creating dummy rules even when there's no data
        const rules = await service.applyOptimizations('/test/workspace');
        expect(rules).toEqual([]);
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should generate rules for high token yield (thrashing)', async () => {
        // Bug this catches: Not detecting high token yield or failing to persist thrashing metrics correctly
        const recentDate = new Date();
        
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: recentDate,
                quality: { create: { tokenYield: 2.5, isZeroShot: true, buildSuccess: true } }
            }
        });
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: recentDate,
                quality: { create: { tokenYield: 2.0, isZeroShot: true, buildSuccess: true } }
            }
        });
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: recentDate,
                quality: { create: { tokenYield: 1.8, isZeroShot: true, buildSuccess: true } }
            }
        });

        const rules = await service.applyOptimizations('/test/workspace');
        expect(rules.length).toBeGreaterThan(0);
        expect(rules[0]).toContain('High token yield (2.10) indicates thrashing');
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should detect agent degradation (token inflation)', async () => {
        // Bug this catches: Missing degradation alert when recent token yield spikes compared to historical average
        const recentDate = new Date();
        const historicalDate = new Date();
        historicalDate.setDate(historicalDate.getDate() - 10); // 10 days ago

        // Recent sessions
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: recentDate,
                quality: { create: { tokenYield: 3.0, isZeroShot: true, buildSuccess: true } }
            }
        });
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: recentDate,
                quality: { create: { tokenYield: 3.0, isZeroShot: true, buildSuccess: true } }
            }
        });
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: recentDate,
                quality: { create: { tokenYield: 3.0, isZeroShot: true, buildSuccess: true } }
            }
        });

        // Historical sessions
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: historicalDate,
                quality: { create: { tokenYield: 1.0, isZeroShot: true, buildSuccess: true } }
            }
        });
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: historicalDate,
                quality: { create: { tokenYield: 1.0, isZeroShot: true, buildSuccess: true } }
            }
        });
        await prisma.agentSession.create({
            data: {
                agentName: 'claude-code', taskType: 'frontend', createdAt: historicalDate,
                quality: { create: { tokenYield: 1.0, isZeroShot: true, buildSuccess: true } }
            }
        });

        const rules = await service.applyOptimizations('/test/workspace');
        expect(rules.some(r => r.includes('Degradation Detected'))).toBe(true);
        expect(rules.some(r => r.includes('spike in token usage (thrashing)'))).toBe(true);
    });
});
