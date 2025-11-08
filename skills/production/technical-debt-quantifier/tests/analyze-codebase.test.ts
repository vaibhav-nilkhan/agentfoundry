import { run as analyzeCodebase } from '../src/tools/analyze-codebase';

// Mock git operations
jest.mock('../src/lib/git-analyzer', () => ({
  GitAnalyzer: {
    cloneRepository: jest.fn().mockResolvedValue({
      getAllFiles: jest.fn().mockResolvedValue([
        '/tmp/repo/src/index.ts',
        '/tmp/repo/src/utils.ts',
      ]),
      getFileChangeFrequency: jest.fn().mockResolvedValue(5),
      getRepoPath: jest.fn().mockReturnValue('/tmp/repo'),
      cleanup: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock file system
jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(`
function example() {
  if (true) {
    for (let i = 0; i < 10; i++) {
      console.log(i);
    }
  }
}
  `),
  mkdir: jest.fn().mockResolvedValue(undefined),
  rm: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue([]),
}));

describe('analyze_codebase', () => {
  it('should analyze repository and return debt analysis', async () => {
    const result = await analyzeCodebase({
      repo_url: 'https://github.com/test/repo',
      branch: 'main',
      config: {
        avg_hourly_rate: 100,
        team_size: 5,
        include_test_files: false,
      },
    });

    expect(result.total_debt_cost_annual).toBeGreaterThan(0);
    expect(result.total_files_analyzed).toBeGreaterThan(0);
    expect(result.debt_categories).toHaveLength(5);
    expect(result.top_problem_files).toBeDefined();
    expect(result.metadata.repo_url).toBe('https://github.com/test/repo');
  });

  it('should reject invalid repository URL', async () => {
    await expect(
      analyzeCodebase({
        repo_url: 'not-a-url',
        branch: 'main',
        config: {},
      })
    ).rejects.toThrow('Invalid input');
  });

  it('should use default configuration', async () => {
    const result = await analyzeCodebase({
      repo_url: 'https://github.com/test/repo',
      branch: 'main',
      config: {},
    });

    expect(result.metadata.config.avg_hourly_rate).toBe(100);
    expect(result.metadata.config.team_size).toBe(5);
  });
});
