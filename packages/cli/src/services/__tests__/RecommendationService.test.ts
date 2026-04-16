import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@agentfoundry/db';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { RecommendationService } from '../RecommendationService';

// Ensure a unique test database
const TEST_DB_PATH = path.join(__dirname, 'test-recommendation.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

describe('RecommendationService - Real DB Integration', () => {
    let service: RecommendationService;

    beforeAll(async () => {
        // Run Prisma DB push to initialize the schema
        const dbDir = path.resolve(__dirname, '../../../../../packages/db');
        execSync(`npx pnpm exec prisma db push --schema=./prisma/schema.prisma --accept-data-loss`, {
            cwd: dbDir,
            env: {
                ...process.env,
                DATABASE_URL: `file:${TEST_DB_PATH}`
            },
            stdio: 'ignore' // Hide verbose output
        });
        
        await prisma.$connect();
        service = new RecommendationService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        // Cleanup the test database
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    beforeEach(async () => {
        // Clean the database tables before each test
        await prisma.agentSession.deleteMany();
    });

    it('should return empty array if no sessions exist', async () => {
        // Bug this catches: Recommending agents even when there is no historical data
        const recommendations = await service.getRecommendations();
        expect(recommendations).toEqual([]);
    });

    it('should calculate weighted scores and sort by descending score based on real data', async () => {
        // Bug this catches: Recommender giving equal weight to poor metrics or sorting ascending
        
        // Insert real test data into SQLite
        const claudeSession = await prisma.agentSession.create({
            data: {
                agentName: 'claude-code',
                taskType: 'frontend',
                durationSeconds: 45,
                quality: {
                    create: {
                        testsPassed: 9,
                        testsFailed: 1,
                        tokenYield: 1.2,
                        buildSuccess: true,
                        isZeroShot: true
                    }
                },
                cost: {
                    create: { tokensIn: 1000, tokensOut: 500, costUsd: 0.05 }
                }
            }
        });

        const geminiSession = await prisma.agentSession.create({
            data: {
                agentName: 'gemini',
                taskType: 'frontend',
                durationSeconds: 30,
                quality: {
                    create: {
                        testsPassed: 5,
                        testsFailed: 5,
                        tokenYield: 3.5,
                        buildSuccess: true,
                        isZeroShot: false
                    }
                },
                cost: {
                    create: { tokensIn: 1000, tokensOut: 500, costUsd: 0.01 }
                }
            }
        });

        const recommendations = await service.getRecommendations({ taskType: 'frontend' });

        expect(recommendations.length).toBe(2);
        expect(recommendations[0].agentName).toBe('claude-code'); // Better pass rate and yield
        expect(recommendations[0].score).toBeGreaterThan(recommendations[1].score);
        expect(recommendations[0].confidence).toBe('low'); // Only 1 session
    });

    it('should assign high confidence for 10+ sessions in the DB', async () => {
        // Bug this catches: The algorithm incorrectly assuming 'low confidence' for statistically significant session counts
        
        // Insert 10 identical sessions
        for (let i = 0; i < 10; i++) {
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude-code',
                    taskType: 'backend',
                    durationSeconds: 15,
                    quality: {
                        create: {
                            testsPassed: 1,
                            testsFailed: 0,
                            tokenYield: 1.0,
                            buildSuccess: true,
                            isZeroShot: true
                        }
                    },
                    cost: {
                        create: { tokensIn: 100, tokensOut: 50, costUsd: 0.02 }
                    }
                }
            });
        }

        const recommendations = await service.getRecommendations({ taskType: 'backend' });

        expect(recommendations.length).toBe(1);
        expect(recommendations[0].confidence).toBe('high');
    });
});