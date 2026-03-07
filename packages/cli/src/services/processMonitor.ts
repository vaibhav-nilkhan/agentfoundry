import findProcess from 'find-process';

export interface AgentProcess {
    pid: number;
    name: string;
    cmd: string;
}

export type AgentType = 'claude-code' | 'codex' | 'gemini' | 'unknown';

export interface ProcessEvent {
    type: 'start' | 'stop';
    agent: AgentType;
    pid: number;
    timestamp: Date;
    cmdHint?: string;
}

export class ProcessMonitor {
    private activeProcesses: Map<number, AgentProcess> = new Map();
    private pollIntervalId?: NodeJS.Timeout;
    private onEvent?: (event: ProcessEvent) => void;

    // Signatures for known agents
    private readonly TARGET_AGENTS = [
        { name: 'claude', type: 'claude-code' as AgentType },
        { name: 'claude-code', type: 'claude-code' as AgentType },
        { name: 'codex', type: 'codex' as AgentType },
        { name: 'gemini', type: 'gemini' as AgentType }
    ];

    constructor(eventCallback?: (event: ProcessEvent) => void) {
        this.onEvent = eventCallback;
    }

    /**
     * Starts polling for agent processes. Safe interval (2s) to avoid CPU spikes.
     */
    public async start(intervalMs: number = 2000): Promise<void> {
        if (this.pollIntervalId) {
            return;
        }

        // Initial snapshot
        await this.scanProcesses();

        this.pollIntervalId = setInterval(async () => {
            await this.scanProcesses();
        }, intervalMs);

        console.log(`[ProcessMonitor] Started polling every ${intervalMs}ms...`);
    }

    public stop(): void {
        if (this.pollIntervalId) {
            clearInterval(this.pollIntervalId);
            this.pollIntervalId = undefined;
            console.log('[ProcessMonitor] Stopped.');
        }
    }

    private async scanProcesses(): Promise<void> {
        try {
            // Find node processes (since claude, codex are often node/python CLIs)
            const processes = await findProcess('name', 'node');
            const processList = processes.map(p => ({
                pid: p.pid,
                name: p.name,
                cmd: p.cmd || ''
            }));

            const currentPids = new Set<number>();

            for (const proc of processList) {
                // Detect if this process is a target agent
                const agentType = this.identifyAgent(proc.cmd);
                if (!agentType) continue;

                currentPids.add(proc.pid);

                // If it's a new process we haven't seen before
                if (!this.activeProcesses.has(proc.pid)) {
                    this.activeProcesses.set(proc.pid, proc);
                    this.emitEvent({
                        type: 'start',
                        agent: agentType,
                        pid: proc.pid,
                        timestamp: new Date(),
                        cmdHint: proc.cmd
                    });
                }
            }

            // Check for stopped processes
            for (const [pid, proc] of this.activeProcesses.entries()) {
                if (!currentPids.has(pid)) {
                    const agentType = this.identifyAgent(proc.cmd);
                    this.emitEvent({
                        type: 'stop',
                        agent: agentType || 'unknown',
                        pid: pid,
                        timestamp: new Date()
                    });
                    this.activeProcesses.delete(pid);
                }
            }
        } catch (error) {
            console.error('[ProcessMonitor] Scan failed:', error);
        }
    }

    private identifyAgent(cmd: string): AgentType | null {
        const cmdLower = cmd.toLowerCase();

        // Ignore our own watching process
        if (cmdLower.includes('agentfoundry watch')) return null;

        for (const target of this.TARGET_AGENTS) {
            // Simple heuristic: if the command line has the agent name in it executing as a script or bin
            if (cmdLower.includes(`/${target.name}`) || cmdLower.includes(`\\${target.name}`) || cmdLower.includes(`${target.name} `)) {
                return target.type;
            }
        }
        return null;
    }

    private emitEvent(event: ProcessEvent) {
        if (this.onEvent) {
            this.onEvent(event);
        }
    }
}
