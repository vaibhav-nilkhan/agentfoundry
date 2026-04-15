import { PrismaClient } from '@agentfoundry/db';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runSimulation() {
    console.log('🚀 Starting Swarm Integration Simulation...');

    // 1. Clear existing sessions
    await prisma.agentSession.deleteMany();
    console.log('🧹 Database cleared.');

    // 2. Start the watch daemon in the background
    const watchProcess = spawn('npx', ['ts-node', 'packages/cli/src/cli.ts', 'watch'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' }
    });

    console.log('📡 Watch daemon started.');

    // Give the daemon a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Simulate Agent A (Claude) starting
    console.log('🤖 Agent A (Claude) starting...');
    const agentA = spawn('node', ['-e', 'console.log("Claude working..."); setTimeout(() => {}, 10000)'], {
        stdio: 'pipe'
    });
    // @ts-ignore - we need the PID to identify it
    const pidA = agentA.pid;

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Simulate Agent B (Codex) starting (OVERLAP)
    console.log('🤖 Agent B (Codex) starting (Swarm detected)...');
    const agentB = spawn('node', ['-e', 'console.log("Codex working..."); setTimeout(() => {}, 10000)'], {
        stdio: 'pipe'
    });
    // @ts-ignore
    const pidB = agentB.pid;

    // 5. Simulate file changes
    const testFileA = path.join(process.cwd(), 'swarm_test_a.txt');
    const testFileB = path.join(process.cwd(), 'swarm_test_b.txt');
    
    fs.writeFileSync(testFileA, `Changed by A at ${Date.now()}`);
    console.log('📝 File A modified.');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    fs.writeFileSync(testFileB, `Changed by B at ${Date.now()}`);
    console.log('📝 File B modified.');

    // 6. Stop agents
    console.log('🛑 Stopping agents...');
    agentA.kill();
    agentB.kill();

    // 7. Wait for daemon to process logs
    console.log('⏳ Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 8. Verify Database
    const sessions = await prisma.agentSession.findMany({
        include: { gitSnapshot: true }
    });

    console.log('\n--- Simulation Results ---');
    console.log(`Total Sessions: ${sessions.length}`);
    
    if (sessions.length >= 2) {
        const s1 = sessions[0];
        const s2 = sessions[1];
        console.log(`Session 1: ${s1.agentName} | SwarmID: ${s1.swarmId}`);
        console.log(`Session 2: ${s2.agentName} | SwarmID: ${s2.swarmId}`);
        
        if (s1.swarmId && s1.swarmId === s2.swarmId) {
            console.log('✅ SUCCESS: Both sessions share the same SwarmID!');
        } else {
            console.log('❌ FAILURE: SwarmIDs do not match or are missing.');
        }
    } else {
        console.log('❌ FAILURE: Not enough sessions recorded.');
    }

    // Cleanup
    watchProcess.kill();
    if (fs.existsSync(testFileA)) fs.unlinkSync(testFileA);
    if (fs.existsSync(testFileB)) fs.unlinkSync(testFileB);
    
    process.exit(sessions.length >= 2 ? 0 : 1);
}

runSimulation().catch(err => {
    console.error('Simulation crashed:', err);
    process.exit(1);
});
