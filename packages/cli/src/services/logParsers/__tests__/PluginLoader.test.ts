import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PluginLoader } from '../PluginLoader';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

vi.mock('fs');

describe('PluginLoader', () => {
    const mockPluginDir = path.join(os.homedir(), '.agentfoundry', 'plugins');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return null if plugin directory does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);
        const parser = PluginLoader.loadPlugin('non-existent');
        expect(parser).toBeNull();
    });

    it('should list plugins correctly', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
            'cursor.js',
            'windsurf.js',
            'readme.md'
        ] as any);

        const plugins = PluginLoader.listPlugins();
        expect(plugins).toContain('cursor');
        expect(plugins).toContain('windsurf');
        expect(plugins).not.toContain('readme');
    });
});
