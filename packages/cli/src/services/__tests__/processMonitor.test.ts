import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProcessMonitor, ProcessEvent } from '../processMonitor';
import findProcess from 'find-process';

// Mock the find-process module
vi.mock('find-process', () => ({
    default: vi.fn()
}));

const mockFindProcess = findProcess as any;

describe('ProcessMonitor', () => {
    let monitor: ProcessMonitor;
    let events: ProcessEvent[] = [];

    beforeEach(() => {
        vi.useFakeTimers();
        events = [];
        monitor = new ProcessMonitor((event) => {
            events.push(event);
        });
    });

    afterEach(() => {
        monitor.stop();
        vi.clearAllMocks();
        vi.clearAllTimers();
    });

    it('should detect when a target agent starts', async () => {
        // Initial scan: no processes
        mockFindProcess.mockResolvedValue([]);
        await monitor.start(1000);

        // Simulated event: claude agent starts
        mockFindProcess.mockResolvedValue([
            { pid: 1234, name: 'node', cmd: 'node /usr/local/bin/claude ' }
        ]);

        // Fast-forward time to trigger the poll
        await vi.advanceTimersByTimeAsync(1000);

        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            type: 'start',
            agent: 'claude-code',
            pid: 1234
        });
    });

    it('should detect when a target agent stops', async () => {
        // Initial scan: agent is running
        mockFindProcess.mockResolvedValue([
            { pid: 5678, name: 'node', cmd: 'node /path/to/gemini ' }
        ]);

        await monitor.start(1000);

        // Expect initial detection
        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('start');
        expect(events[0].agent).toBe('gemini');

        // Simulated event: agent dies / finishes
        mockFindProcess.mockResolvedValue([]);

        await vi.advanceTimersByTimeAsync(1000);

        expect(events).toHaveLength(2);
        expect(events[1]).toMatchObject({
            type: 'stop',
            agent: 'gemini',
            pid: 5678
        });
    });

    it('should ignore processes that are not agents', async () => {
        mockFindProcess.mockResolvedValue([
            { pid: 9999, name: 'node', cmd: 'node index.js' }
        ]);
        await monitor.start(1000);

        expect(events).toHaveLength(0);
    });
});
