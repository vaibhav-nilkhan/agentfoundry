import { run as analyzePR } from '../src/tools/analyze-pr';

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    pulls: {
      get: jest.fn().mockResolvedValue({
        data: {
          title: 'Test PR',
          body: 'Test description',
          state: 'open',
          user: { login: 'testuser' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      }),
      listFiles: jest.fn().mockResolvedValue({
        data: [
          {
            filename: 'src/test.ts',
            status: 'modified',
            additions: 10,
            deletions: 5,
            changes: 15,
            patch: '+ const test = "hello";',
          },
        ],
      }),
    },
  })),
}));

describe('analyze_pr', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GITHUB_TOKEN: 'test_token' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should analyze a PR successfully', async () => {
    const result = await analyzePR({
      repo_owner: 'testowner',
      repo_name: 'testrepo',
      pr_number: 1,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.status).toMatch(/excellent|good|needs_improvement|poor/);
    expect(result.files_changed).toBe(1);
    expect(result.lines_added).toBe(10);
    expect(result.lines_deleted).toBe(5);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.pr_title).toBe('Test PR');
  });

  it('should reject invalid PR number', async () => {
    await expect(
      analyzePR({
        repo_owner: 'testowner',
        repo_name: 'testrepo',
        pr_number: -1,
      })
    ).rejects.toThrow('Invalid input');
  });

  it('should reject missing parameters', async () => {
    await expect(analyzePR({} as any)).rejects.toThrow();
  });

  it('should require GITHUB_TOKEN', async () => {
    delete process.env.GITHUB_TOKEN;

    await expect(
      analyzePR({
        repo_owner: 'testowner',
        repo_name: 'testrepo',
        pr_number: 1,
      })
    ).rejects.toThrow('GITHUB_TOKEN');
  });
});
