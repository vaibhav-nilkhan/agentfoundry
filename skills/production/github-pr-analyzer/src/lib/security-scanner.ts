/**
 * Security scanning for code files
 */

interface SecurityIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export class SecurityScanner {
  private patterns = {
    hardcoded_secrets: [
      { regex: /(api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/, severity: 'critical' as const },
      { regex: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/, severity: 'critical' as const },
      { regex: /(secret|token)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/, severity: 'critical' as const },
      { regex: /sk_live_[a-zA-Z0-9]{24,}/, severity: 'critical' as const }, // Stripe live keys
      { regex: /gh[pousr]_[A-Za-z0-9_]{36,}/, severity: 'critical' as const }, // GitHub tokens
    ],
    sql_injection: [
      { regex: /execute\s*\(\s*['"]\s*select\s+.*\s*\+\s*/i, severity: 'high' as const },
      { regex: /query\s*\(\s*.*\s*\+\s*.*\)/i, severity: 'high' as const },
    ],
    xss_vulnerabilities: [
      { regex: /innerHTML\s*=\s*[^;]+;/, severity: 'medium' as const },
      { regex: /document\.write\s*\(/, severity: 'medium' as const },
      { regex: /eval\s*\(/, severity: 'high' as const },
    ],
    command_injection: [
      { regex: /exec\s*\(\s*.*\s*\+\s*/i, severity: 'high' as const },
      { regex: /system\s*\(\s*.*\s*\+\s*/i, severity: 'high' as const },
    ],
  };

  /**
   * Scan files for security vulnerabilities
   */
  async scan(files: GitHubFile[]): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    for (const file of files) {
      // Skip non-code files
      if (this.shouldSkipFile(file.filename)) {
        continue;
      }

      // Scan file content
      if (file.patch) {
        const fileIssues = this.scanContent(file.filename, file.patch);
        issues.push(...fileIssues);
      }
    }

    return issues;
  }

  /**
   * Scan file content for security patterns
   */
  private scanContent(filename: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for hardcoded secrets
    for (const pattern of this.patterns.hardcoded_secrets) {
      if (pattern.regex.test(content)) {
        issues.push({
          type: 'hardcoded_secret',
          severity: pattern.severity,
          file: filename,
          description: 'Potential hardcoded secret or API key detected',
          recommendation: 'Use environment variables for sensitive data',
        });
      }
    }

    // Check for SQL injection
    for (const pattern of this.patterns.sql_injection) {
      if (pattern.regex.test(content)) {
        issues.push({
          type: 'sql_injection',
          severity: pattern.severity,
          file: filename,
          description: 'Potential SQL injection vulnerability',
          recommendation: 'Use parameterized queries or ORM',
        });
      }
    }

    // Check for XSS vulnerabilities
    for (const pattern of this.patterns.xss_vulnerabilities) {
      if (pattern.regex.test(content)) {
        issues.push({
          type: 'xss_vulnerability',
          severity: pattern.severity,
          file: filename,
          description: 'Potential cross-site scripting (XSS) vulnerability',
          recommendation: 'Sanitize user input and use safe DOM manipulation',
        });
      }
    }

    // Check for command injection
    for (const pattern of this.patterns.command_injection) {
      if (pattern.regex.test(content)) {
        issues.push({
          type: 'command_injection',
          severity: pattern.severity,
          file: filename,
          description: 'Potential command injection vulnerability',
          recommendation: 'Avoid executing shell commands with user input',
        });
      }
    }

    return issues;
  }

  /**
   * Check if file should be skipped
   */
  private shouldSkipFile(filename: string): boolean {
    const skipExtensions = ['.md', '.txt', '.json', '.yaml', '.yml', '.lock', '.svg', '.png', '.jpg'];
    const skipDirs = ['node_modules/', 'vendor/', 'dist/', 'build/', '.git/'];

    return (
      skipExtensions.some(ext => filename.endsWith(ext)) ||
      skipDirs.some(dir => filename.includes(dir))
    );
  }
}
