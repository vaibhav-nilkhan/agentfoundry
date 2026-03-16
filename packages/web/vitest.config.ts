import { defineConfig } from 'vitest/config';
import path from 'path';

const workspaceNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(workspaceNodeModules, 'react'),
      'react-dom': path.resolve(workspaceNodeModules, 'react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});