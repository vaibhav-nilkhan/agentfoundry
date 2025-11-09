/**
 * Version Recommender
 * Recommends semantic version bumps based on breaking changes
 */

import * as semver from 'semver';
import { BreakingChange } from './breaking-change-detector';

export interface VersionRecommendation {
  recommended_version: string;
  bump_type: 'major' | 'minor' | 'patch';
  reason: string;
  should_block: boolean;
}

export class VersionRecommender {
  /**
   * Recommend version bump based on breaking changes
   */
  recommendVersion(currentVersion: string, changes: BreakingChange[], strictMode: boolean = false): VersionRecommendation {
    // Validate current version
    if (!semver.valid(currentVersion)) {
      throw new Error(`Invalid semver version: ${currentVersion}`);
    }

    const hasCritical = changes.some(c => c.severity === 'critical');
    const hasMajor = changes.some(c => c.severity === 'major');
    const hasMinor = changes.some(c => c.severity === 'minor');

    // Critical or major changes require major version bump
    if (hasCritical || hasMajor) {
      return {
        recommended_version: semver.inc(currentVersion, 'major')!,
        bump_type: 'major',
        reason: this.getMajorBumpReason(changes, hasCritical),
        should_block: true,
      };
    }

    // Minor changes in strict mode also require major bump
    if (strictMode && hasMinor) {
      return {
        recommended_version: semver.inc(currentVersion, 'major')!,
        bump_type: 'major',
        reason: 'Strict mode enabled: minor changes treated as breaking',
        should_block: true,
      };
    }

    // Minor changes (backward compatible additions)
    if (hasMinor) {
      return {
        recommended_version: semver.inc(currentVersion, 'minor')!,
        bump_type: 'minor',
        reason: 'Minor backward-compatible changes detected',
        should_block: false,
      };
    }

    // No changes or only patches
    return {
      recommended_version: semver.inc(currentVersion, 'patch')!,
      bump_type: 'patch',
      reason: 'No breaking changes detected - safe to deploy',
      should_block: false,
    };
  }

  /**
   * Generate summary of changes by severity
   */
  summarizeChanges(changes: BreakingChange[]): {
    total: number;
    critical: number;
    major: number;
    minor: number;
  } {
    return {
      total: changes.length,
      critical: changes.filter(c => c.severity === 'critical').length,
      major: changes.filter(c => c.severity === 'major').length,
      minor: changes.filter(c => c.severity === 'minor').length,
    };
  }

  /**
   * Generate reason for major version bump
   */
  private getMajorBumpReason(changes: BreakingChange[], hasCritical: boolean): string {
    const summary = this.summarizeChanges(changes);

    if (hasCritical) {
      return `${summary.critical} critical breaking change(s) detected that will break existing consumers`;
    }

    return `${summary.major} major breaking change(s) detected requiring consumer updates`;
  }

  /**
   * Check if version change is sufficient for detected changes
   */
  isVersionBumpSufficient(
    oldVersion: string,
    newVersion: string,
    changes: BreakingChange[]
  ): { sufficient: boolean; reason: string } {
    const recommendation = this.recommendVersion(oldVersion, changes);
    const actualBump = this.getBumpType(oldVersion, newVersion);

    const bumpHierarchy: Record<string, number> = {
      major: 3,
      minor: 2,
      patch: 1,
    };

    const recommendedLevel = bumpHierarchy[recommendation.bump_type];
    const actualLevel = bumpHierarchy[actualBump];

    if (actualLevel >= recommendedLevel) {
      return {
        sufficient: true,
        reason: `Version bump from ${oldVersion} to ${newVersion} is sufficient`,
      };
    }

    return {
      sufficient: false,
      reason: `Version bump should be ${recommendation.bump_type} (recommended: ${recommendation.recommended_version}), but got ${actualBump} (${newVersion})`,
    };
  }

  /**
   * Determine what type of bump occurred between two versions
   */
  private getBumpType(oldVersion: string, newVersion: string): 'major' | 'minor' | 'patch' {
    const diff = semver.diff(oldVersion, newVersion);

    if (diff === 'major' || diff === 'premajor') return 'major';
    if (diff === 'minor' || diff === 'preminor') return 'minor';
    return 'patch';
  }
}
