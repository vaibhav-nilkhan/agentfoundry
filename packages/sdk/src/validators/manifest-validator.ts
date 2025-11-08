/**
 * ManifestValidator - Validates Skill manifests
 */
import { SkillManifest, ValidationResult } from '../types';

export class ManifestValidator {
  /**
   * Validate a Skill manifest
   */
  validate(manifest: SkillManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!manifest.name || manifest.name.trim().length === 0) {
      errors.push('Skill name is required');
    }

    if (!manifest.version || !this.isValidVersion(manifest.version)) {
      errors.push('Valid version (semver) is required');
    }

    if (!manifest.description || manifest.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    if (!manifest.author || manifest.author.trim().length === 0) {
      errors.push('Author is required');
    }

    if (!manifest.platforms || manifest.platforms.length === 0) {
      errors.push('At least one platform must be specified');
    }

    if (!manifest.permissions || manifest.permissions.length === 0) {
      warnings.push('No permissions declared - ensure your Skill does not require any');
    }

    // Warnings
    if (manifest.name && manifest.name.length > 50) {
      warnings.push('Skill name should be 50 characters or less');
    }

    if (manifest.description && manifest.description.length > 200) {
      warnings.push('Short description should be 200 characters or less');
    }

    if (!manifest.category) {
      warnings.push('Consider adding a category for better discoverability');
    }

    if (!manifest.tags || manifest.tags.length === 0) {
      warnings.push('Consider adding tags for better discoverability');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a version string is valid semver
   */
  private isValidVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
    return semverRegex.test(version);
  }
}
