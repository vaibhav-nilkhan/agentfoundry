import { run as analyzeContentGaps } from '../src/tools/analyze-content-gaps';

describe('analyze_content_gaps', () => {
  it('should find content gaps between your domain and competitors', async () => {
    const result = await analyzeContentGaps({
      your_domain: 'example.com',
      competitor_domains: ['competitor1.com', 'competitor2.com'],
      content_type: 'all',
      language: 'en',
    });

    expect(result.gaps).toBeDefined();
    expect(Array.isArray(result.gaps)).toBe(true);
    expect(result.summary.total_gaps).toBeGreaterThan(0);
    expect(result.metadata.your_domain).toBe('example.com');
  });

  it('should limit competitors to 5', async () => {
    await expect(
      analyzeContentGaps({
        your_domain: 'example.com',
        competitor_domains: ['c1.com', 'c2.com', 'c3.com', 'c4.com', 'c5.com', 'c6.com'],
        content_type: 'all',
        language: 'en',
      })
    ).rejects.toThrow();
  });

  it('should validate required fields', async () => {
    await expect(
      analyzeContentGaps({
        your_domain: '',
        competitor_domains: [],
      } as any)
    ).rejects.toThrow();
  });
});
