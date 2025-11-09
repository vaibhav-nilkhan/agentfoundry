import { run as scanCodebase } from '../src/tools/scan-codebase';

describe('scan_codebase', () => {
  it('should scan repository and find vulnerabilities', async () => {
    const result = await scanCodebase({
      repo_url: 'https://github.com/example/repo',
      branch: 'main',
      scan_depth: 'standard',
      include_dependencies: true,
      compliance_framework: 'none',
    });

    expect(result.scan_id).toBeDefined();
    expect(result.vulnerabilities).toBeDefined();
    expect(Array.isArray(result.vulnerabilities)).toBe(true);
    expect(result.summary.total_vulnerabilities).toBeGreaterThan(0);
    expect(result.risk_score).toBeGreaterThanOrEqual(0);
    expect(result.risk_score).toBeLessThanOrEqual(100);
  });

  it('should reject invalid URL', async () => {
    await expect(
      scanCodebase({
        repo_url: 'invalid-url',
        branch: 'main',
      } as any)
    ).rejects.toThrow();
  });

  it('should validate scan depth options', async () => {
    const result = await scanCodebase({
      repo_url: 'https://github.com/example/repo',
      branch: 'main',
      scan_depth: 'quick',
      include_dependencies: true,
      compliance_framework: 'none',
    });

    expect(result.metadata.scan_depth).toBe('quick');
  });
});
