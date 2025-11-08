import { run } from '../src/tools/my-tool';

describe('my_tool', () => {
  it('should process input successfully', async () => {
    const result = await run({
      input_param: 'test value',
    });

    expect(result.result).toContain('test value');
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.timestamp).toBeDefined();
  });

  it('should reject empty input', async () => {
    await expect(run({ input_param: '' })).rejects.toThrow('Invalid input');
  });

  it('should handle missing parameters', async () => {
    await expect(run({} as any)).rejects.toThrow();
  });
});
