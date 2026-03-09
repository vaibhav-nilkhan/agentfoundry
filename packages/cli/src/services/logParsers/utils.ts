import * as fs from 'fs';
import * as path from 'path';

/**
 * Finds JSONL log files modified recently (within the session timeframe).
 */
export function findRecentLogFiles(dir: string, since: Date): string[] {
    const results: string[] = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Recurse into subdirectories
                results.push(...findRecentLogFiles(fullPath, since));
            } else if (entry.name.endsWith('.jsonl') || entry.name.endsWith('.log')) {
                const stat = fs.statSync(fullPath);
                // Include files modified after the session started
                if (stat.mtime >= since) {
                    results.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`[LogParser] Failed to read directory ${dir}:`, error);
    }

    return results;
}
