import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const prisma = new PrismaClient();

describe('AgentFoundry V2 Database Schema', () => {
  beforeAll(async () => {
    // Ensure we can connect to the SQLite DB
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup the specific test data we created
    await prisma.agentSession.deleteMany({
      where: { agentName: 'test-agent-run' }
    });
    await prisma.$disconnect();
  });

  it('should successfully create and retrieve an AgentSession with relations', async () => {
    // Create a mock session
    const session = await prisma.agentSession.create({
      data: {
        agentName: 'test-agent-run',
        taskHint: 'Run vitest checks',
        durationSeconds: 15,
        cost: {
          create: {
            tokensIn: 100,
            tokensOut: 50,
            costUsd: 0.001
          }
        },
        quality: {
          create: {
            testsPassed: 5,
            testsFailed: 0,
            lintIssues: 0,
            buildSuccess: true
          }
        },
        gitSnapshot: {
          create: {
            filesChanged: JSON.stringify(['src/index.ts']),
            linesAdded: 10,
            linesRemoved: 2
          }
        }
      },
      include: {
        cost: true,
        quality: true,
        gitSnapshot: true
      }
    });

    expect(session).toBeDefined();
    expect(session.id).toBeTypeOf('string');
    expect(session.agentName).toBe('test-agent-run');
    
    // Check relations
    expect(session.cost).toBeDefined();
    expect(session.cost?.tokensIn).toBe(100);
    expect(session.cost?.costUsd).toBe(0.001);

    expect(session.quality).toBeDefined();
    expect(session.quality?.testsPassed).toBe(5);
    expect(session.quality?.buildSuccess).toBe(true);

    expect(session.gitSnapshot).toBeDefined();
    expect(session.gitSnapshot?.linesAdded).toBe(10);
    expect(JSON.parse(session.gitSnapshot?.filesChanged || '[]')).toContain('src/index.ts');

    // Retrieve the session from the DB to verify persistence
    const fetchedSession = await prisma.agentSession.findUnique({
      where: { id: session.id },
      include: { cost: true, quality: true, gitSnapshot: true }
    });

    expect(fetchedSession).toBeDefined();
    expect(fetchedSession?.id).toBe(session.id);
    expect(fetchedSession?.cost?.tokensIn).toBe(100);
    expect(fetchedSession?.quality?.buildSuccess).toBe(true);
    expect(fetchedSession?.gitSnapshot?.linesAdded).toBe(10);
  });
});
