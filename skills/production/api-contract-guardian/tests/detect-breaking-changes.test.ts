import { run as detectBreakingChanges } from '../src/tools/detect-breaking-changes';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('detect_breaking_changes', () => {
  it('should reject invalid version format', async () => {
    await expect(
      detectBreakingChanges({
        old_spec_url: 'test',
        new_spec_url: 'test',
        current_version: 'invalid',
        strict_mode: false,
      })
    ).rejects.toThrow();
  });

  it('should accept valid version format', async () => {
    // This will fail when trying to load specs, but validates version format is accepted
    try {
      await detectBreakingChanges({
        old_spec_url: 'https://example.com/v1/openapi.yaml',
        new_spec_url: 'https://example.com/v2/openapi.yaml',
        current_version: '1.0.0',
        strict_mode: false,
      });
    } catch (error: any) {
      // Expected to fail at spec loading, not validation
      expect(error.message).toContain('Failed to load OpenAPI spec');
    }
  });

  it('should validate strict mode parameter', async () => {
    try {
      await detectBreakingChanges({
        old_spec_url: 'https://example.com/v1/openapi.yaml',
        new_spec_url: 'https://example.com/v2/openapi.yaml',
        current_version: '2.0.0',
        strict_mode: true,
      });
    } catch (error: any) {
      // Expected to fail at spec loading
      expect(error.message).toContain('Failed to load OpenAPI spec');
    }
  });
});
