import { GitIntegration, GitSnapshotData } from './gitIntegration';
import { AgentType } from './processMonitor';

export interface SwarmSession {
    pid: number;
    agent: AgentType;
    startTime: Date;
    startSnapshot: GitSnapshotData;
    wasInSwarm: boolean;
}

export class SwarmManager {
    private activeSessions: Map<number, SwarmSession> = new Map();
    private git: GitIntegration;
    private swarmBaseSnapshot?: GitSnapshotData;
    private currentSwarmId?: string;

    constructor() {
        this.git = new GitIntegration();
    }

    /**
     * Called when an agent process starts.
     */
    public async registerStart(pid: number, agent: AgentType, timestamp: Date): Promise<void> {
        const isSwarm = this.activeSessions.size > 0;

        // If this is the first agent in a potential swarm, start a new swarm session
        if (this.activeSessions.size === 0) {
            this.swarmBaseSnapshot = await this.git.takeSnapshot();
            this.currentSwarmId = `swarm_${Date.now()}`;
        } else {
            // Mark all existing sessions as part of a swarm
            for (const session of this.activeSessions.values()) {
                session.wasInSwarm = true;
            }
        }

        // Take a per-agent snapshot as well for individual delta tracking
        const startSnapshot = await this.git.takeSnapshot();
        
        this.activeSessions.set(pid, {
            pid,
            agent,
            startTime: timestamp,
            startSnapshot,
            wasInSwarm: isSwarm
        });
    }

    /**
     * Called when an agent process stops. Calculates its specific delta.
     */
    public async registerStop(pid: number): Promise<{ delta: GitSnapshotData, session: SwarmSession, swarmId?: string } | null> {
        const session = this.activeSessions.get(pid);
        if (!session) return null;

        const swarmId = session.wasInSwarm ? this.currentSwarmId : undefined;

        const stopSnapshot = await this.git.takeSnapshot();
        const delta = this.git.calculateDelta(session.startSnapshot, stopSnapshot);

        // Update other active sessions' start snapshots to current state
        for (const [otherPid, otherSession] of this.activeSessions.entries()) {
            if (otherPid !== pid) {
                this.updateBaseline(otherSession, delta, stopSnapshot);
            }
        }

        this.activeSessions.delete(pid);
        
        // If no more agents are running, clear the swarm
        if (this.activeSessions.size === 0) {
            this.swarmBaseSnapshot = undefined;
            this.currentSwarmId = undefined;
        }

        return { delta, session, swarmId };
    }

    /**
     * Prevents double-counting by updating the baseline of concurrent agents
     * when one agent finishes and "claims" its changes.
     */
    private updateBaseline(session: SwarmSession, delta: GitSnapshotData, currentSnapshot: GitSnapshotData) {
        // Simple strategy: Update the other agent's start snapshot to match current state
        // for the files that were just committed/processed.
        // This is complex to do perfectly without a real file watcher, but updating 
        // the whole snapshot is a safe "snapshot-in-time" approach.
        session.startSnapshot = currentSnapshot;
    }

    public getActiveSessions(): Map<number, SwarmSession> {
        return this.activeSessions;
    }

    public getActiveCount(): number {
        return this.activeSessions.size;
    }

    public isSwarmActive(): boolean {
        return this.activeSessions.size > 1;
    }
}
