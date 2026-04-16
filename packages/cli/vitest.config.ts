import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.ts'],
        exclude: ['node_modules', 'dist'],
        hookTimeout: 120000,
        testTimeout: 30000
    }
});
