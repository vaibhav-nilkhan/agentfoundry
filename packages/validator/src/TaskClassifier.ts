export class TaskClassifier {
    /**
     * Heuristics for classifying a task type based on the files changed.
     * Returns the first matching category.
     */
    static classify(filesChanged: string[]): string {
        if (!filesChanged || filesChanged.length === 0) {
            return 'unknown';
        }

        let hasTesting = false;
        let hasBackend = false;
        let hasFrontend = false;
        let hasConfig = false;
        let hasDocs = false;

        for (const file of filesChanged) {
            const lowerFile = file.toLowerCase();

            // configuration
            if (
                lowerFile.includes('package.json') ||
                lowerFile.includes('tsconfig.json') ||
                lowerFile.includes('webpack.config') ||
                lowerFile.includes('vite.config') ||
                lowerFile.includes('.eslintrc') ||
                lowerFile.includes('.prettierrc') ||
                lowerFile.includes('dockerfile') ||
                lowerFile.includes('docker-compose') ||
                lowerFile.includes('.env') ||
                lowerFile.includes('turbo.json') ||
                lowerFile.includes('schema.prisma')
            ) {
                hasConfig = true;
            }

            // testing
            if (
                lowerFile.includes('.test.') ||
                lowerFile.includes('.spec.') ||
                lowerFile.includes('__tests__') ||
                lowerFile.includes('tests/')
            ) {
                hasTesting = true;
            }

            // frontend
            if (
                lowerFile.includes('src/components/') ||
                lowerFile.includes('src/app/') ||
                lowerFile.includes('src/pages/') ||
                lowerFile.includes('src/hooks/') ||
                lowerFile.includes('src/styles/') ||
                lowerFile.endsWith('.css') ||
                lowerFile.endsWith('.scss') ||
                (lowerFile.endsWith('.tsx') && !lowerFile.includes('__tests__')) ||
                (lowerFile.endsWith('.jsx') && !lowerFile.includes('__tests__'))
            ) {
                hasFrontend = true;
            }

            // backend
            if (
                lowerFile.includes('src/api/') ||
                lowerFile.includes('src/services/') ||
                lowerFile.includes('src/controllers/') ||
                lowerFile.includes('src/middleware/') ||
                lowerFile.includes('src/database/') ||
                lowerFile.includes('src/db/') ||
                lowerFile.includes('src/models/') ||
                lowerFile.includes('packages/db/') ||
                lowerFile.includes('packages/api/') ||
                lowerFile.includes('packages/mcp-adapter/') ||
                lowerFile.includes('packages/cli/') ||
                lowerFile.includes('packages/validator/')
            ) {
                hasBackend = true;
            }

            // docs
            if (lowerFile.endsWith('.md') || lowerFile.endsWith('.txt')) {
                hasDocs = true;
            }
        }

        // Determine dominant category based on somewhat arbitrary priorities
        if (hasTesting && !hasBackend && !hasFrontend) return 'testing';
        if (hasConfig && !hasBackend && !hasFrontend) return 'configuration';
        if (hasBackend && hasFrontend) return 'fullstack';
        if (hasBackend) return 'backend';
        if (hasFrontend) return 'frontend';
        if (hasTesting) return 'testing'; // e.g. tests + backend
        if (hasDocs) return 'documentation';
        if (hasConfig) return 'configuration';

        return 'other';
    }
}
