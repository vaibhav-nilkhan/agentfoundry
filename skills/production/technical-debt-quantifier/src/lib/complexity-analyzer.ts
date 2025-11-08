/**
 * Complexity analysis for code files
 */

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  functionCount: number;
  averageComplexity: number;
}

export class ComplexityAnalyzer {
  /**
   * Calculate cyclomatic complexity for a file
   */
  calculateComplexity(fileContent: string, language: string): ComplexityMetrics {
    const lines = fileContent.split('\n');
    const linesOfCode = lines.filter(line =>
      line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('*')
    ).length;

    // Simple complexity calculation based on control flow statements
    const complexityPatterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\s*.*:\s*/g, // Ternary operators
      /&&|\|\|/g, // Logical operators
    ];

    let complexity = 1; // Base complexity
    for (const pattern of complexityPatterns) {
      const matches = fileContent.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    // Count functions
    const functionPatterns = {
      typescript: /function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>|async\s+\w+\s*\(/g,
      javascript: /function\s+\w+|const\s+\w+\s*=\s*\(.*\)\s*=>|async\s+\w+\s*\(/g,
      python: /def\s+\w+\s*\(/g,
      java: /(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\(/g,
    };

    const functionPattern = functionPatterns[language as keyof typeof functionPatterns] ||
                           functionPatterns.typescript;
    const functions = fileContent.match(functionPattern);
    const functionCount = functions ? functions.length : 0;

    const averageComplexity = functionCount > 0 ? complexity / functionCount : complexity;

    return {
      cyclomaticComplexity: complexity,
      linesOfCode,
      functionCount,
      averageComplexity,
    };
  }

  /**
   * Calculate maintenance cost based on complexity
   */
  calculateMaintenanceCost(
    metrics: ComplexityMetrics,
    changeFrequency: number,
    hourlyRate: number
  ): number {
    // High complexity + frequent changes = high cost
    const complexityFactor = metrics.cyclomaticComplexity / 10; // Normalize
    const sizeFactor = metrics.linesOfCode / 100; // Normalize

    // Hours per month spent maintaining this file
    const maintenanceHours = (complexityFactor * changeFrequency * 0.5) + (sizeFactor * 0.2);

    // Annual cost
    return maintenanceHours * 12 * hourlyRate;
  }
}
