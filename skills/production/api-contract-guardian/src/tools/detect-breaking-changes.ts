import { z } from 'zod';
import { SpecParser } from '../lib/spec-parser';
import { BreakingChangeDetector, BreakingChange } from '../lib/breaking-change-detector';
import { VersionRecommender } from '../lib/version-recommender';

const inputSchema = z.object({
  old_spec_url: z.string().min(1, 'Old spec URL is required'),
  new_spec_url: z.string().min(1, 'New spec URL is required'),
  current_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g., 2.1.0)'),
  strict_mode: z.boolean().default(false),
});

interface BreakingChangeOutput {
  has_breaking_changes: boolean;
  breaking_changes: BreakingChange[];
  recommended_version: string;
  version_bump_type: 'major' | 'minor' | 'patch';
  should_block_release: boolean;
  summary: {
    total_changes: number;
    critical_count: number;
    major_count: number;
    minor_count: number;
  };
  metadata: {
    old_spec_url: string;
    new_spec_url: string;
    current_version: string;
    analyzed_at: string;
    strict_mode: boolean;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<BreakingChangeOutput> {
  const validated = inputSchema.parse(input);

  const parser = new SpecParser();
  const detector = new BreakingChangeDetector();
  const recommender = new VersionRecommender();

  try {
    console.log(`Loading old spec: ${validated.old_spec_url}`);
    const oldSpec = await parser.loadSpec(validated.old_spec_url);

    console.log(`Loading new spec: ${validated.new_spec_url}`);
    const newSpec = await parser.loadSpec(validated.new_spec_url);

    console.log('Detecting breaking changes...');
    const changes = await detector.detectChanges(oldSpec, newSpec);

    console.log(`Found ${changes.length} change(s)`);

    // Get version recommendation
    const recommendation = recommender.recommendVersion(
      validated.current_version,
      changes,
      validated.strict_mode
    );

    // Summarize changes
    const summary = recommender.summarizeChanges(changes);

    return {
      has_breaking_changes: changes.length > 0,
      breaking_changes: changes,
      recommended_version: recommendation.recommended_version,
      version_bump_type: recommendation.bump_type,
      should_block_release: recommendation.should_block,
      summary: {
        total_changes: summary.total,
        critical_count: summary.critical,
        major_count: summary.major,
        minor_count: summary.minor,
      },
      metadata: {
        old_spec_url: validated.old_spec_url,
        new_spec_url: validated.new_spec_url,
        current_version: validated.current_version,
        analyzed_at: new Date().toISOString(),
        strict_mode: validated.strict_mode,
      },
    };
  } catch (error: any) {
    throw new Error(`Breaking change detection failed: ${error.message}`);
  }
}
