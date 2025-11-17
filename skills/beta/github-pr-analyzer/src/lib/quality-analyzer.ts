/**
 * Code quality analysis
 */

interface CodeSmell {
  type: string;
  severity: 'major' | 'minor';
  file: string;
  description: string;
}

interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export class QualityAnalyzer {
  /**
   * Analyze code quality
   */
  async analyze(files: GitHubFile[]): Promise<CodeSmell[]> {
    const smells: CodeSmell[] = [];

    for (const file of files) {
      // Check file size
      if (file.additions > 300) {
        smells.push({
          type: 'large_file_change',
          severity: 'minor',
          file: file.filename,
          description: `Large file change (${file.additions} lines added)`,
        });
      }

      // Check if file is entirely new and large
      if (file.status === 'added' && file.additions > 500) {
        smells.push({
          type: 'large_new_file',
          severity: 'minor',
          file: file.filename,
          description: 'Large new file - consider breaking into smaller modules',
        });
      }

      // Analyze patch content if available
      if (file.patch) {
        const patchSmells = this.analyzePatch(file.filename, file.patch);
        smells.push(...patchSmells);
      }
    }

    return smells;
  }

  /**
   * Analyze patch content for code smells
   */
  private analyzePatch(filename: string, patch: string): CodeSmell[] {
    const smells: CodeSmell[] = [];

    // Check for console.log statements (JavaScript/TypeScript)
    if ((filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.tsx')) &&
        /\+.*console\.log/.test(patch)) {
      smells.push({
        type: 'debug_statement',
        severity: 'minor',
        file: filename,
        description: 'Debug console.log statement left in code',
      });
    }

    // Check for TODO comments
    if (/\+.*TODO/i.test(patch)) {
      smells.push({
        type: 'todo_comment',
        severity: 'minor',
        file: filename,
        description: 'TODO comment found - consider addressing before merging',
      });
    }

    // Check for commented code
    const commentedCodeLines = (patch.match(/\+\s*\/\/.+/g) || []).length;
    if (commentedCodeLines > 5) {
      smells.push({
        type: 'commented_code',
        severity: 'minor',
        file: filename,
        description: 'Multiple commented code lines - remove if not needed',
      });
    }

    // Check for long lines
    const longLines = (patch.match(/\+.{120,}/g) || []).length;
    if (longLines > 3) {
      smells.push({
        type: 'long_lines',
        severity: 'minor',
        file: filename,
        description: 'Multiple lines exceed 120 characters - consider breaking up',
      });
    }

    return smells;
  }
}
