import { run as predictVirality } from '../src/tools/predict-virality';

describe('predict_virality', () => {
  it('should predict virality for Twitter content', async () => {
    const result = await predictVirality({
      content: "Here's what nobody tells you about building AI agents. A thread 🧵",
      platform: 'twitter',
    });

    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(100);
    expect(result.rating).toMatch(/poor|fair|good|excellent|viral/);
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.hook_strength).toBeDefined();
    expect(result.predicted_metrics).toBeDefined();
    expect(result.predicted_metrics.impressions).toBeGreaterThan(0);
  });

  it('should provide improvements', async () => {
    const result = await predictVirality({
      content: 'Just another post.',
      platform: 'twitter',
    });

    expect(result.improvements).toBeDefined();
    expect(result.improvements.length).toBeGreaterThan(0);
    expect(result.improvements[0].issue).toBeDefined();
    expect(result.improvements[0].recommendation).toBeDefined();
  });

  it('should reject invalid platform', async () => {
    await expect(
      predictVirality({
        content: 'Test content',
        platform: 'invalid' as any,
      })
    ).rejects.toThrow();
  });

  it('should handle media URLs', async () => {
    const result = await predictVirality({
      content: 'Content with image',
      platform: 'instagram',
      media: ['https://example.com/image.jpg'],
    });

    expect(result.breakdown.visual_appeal).toBeGreaterThan(30);
  });
});
