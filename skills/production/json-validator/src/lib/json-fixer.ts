import { jsonrepair } from 'jsonrepair';

export type FixLevel = 'conservative' | 'moderate' | 'aggressive';

export interface FixResult {
  fixed_json: string;
  is_valid: boolean;
  fixes_applied: Fix[];
  parse_result: any;
  confidence: number;
}

export interface Fix {
  type: string;
  location: string;
  original: string;
  fixed: string;
}

export class JsonFixer {
  /**
   * Attempt to fix malformed JSON
   */
  fix(jsonString: string, fixLevel: FixLevel = 'moderate', preserveComments: boolean = false): FixResult {
    const fixes: Fix[] = [];
    let confidence = 100;

    // Try to parse as-is first
    try {
      const parsed = JSON.parse(jsonString);
      return {
        fixed_json: jsonString,
        is_valid: true,
        fixes_applied: [],
        parse_result: parsed,
        confidence: 100,
      };
    } catch (error) {
      // JSON is invalid, needs fixing
    }

    let fixed = jsonString;

    // Apply fixes based on level
    if (fixLevel === 'conservative' || fixLevel === 'moderate' || fixLevel === 'aggressive') {
      // Remove comments if not preserving
      if (!preserveComments) {
        const commentResult = this.removeComments(fixed);
        if (commentResult.changed) {
          fixes.push({
            type: 'remove_comments',
            location: 'global',
            original: 'Had comments',
            fixed: 'Comments removed',
          });
          fixed = commentResult.result;
          confidence -= 5;
        }
      }

      // Fix common issues
      fixed = this.fixCommonIssues(fixed, fixes);
      confidence -= fixes.length * 5;
    }

    if (fixLevel === 'moderate' || fixLevel === 'aggressive') {
      // Use jsonrepair library for more aggressive fixes
      try {
        const repaired = jsonrepair(fixed);
        if (repaired !== fixed) {
          fixes.push({
            type: 'jsonrepair',
            location: 'global',
            original: 'Malformed JSON',
            fixed: 'Repaired by jsonrepair library',
          });
          fixed = repaired;
          confidence -= 10;
        }
      } catch (e) {
        // jsonrepair failed, continue with what we have
        confidence -= 20;
      }
    }

    if (fixLevel === 'aggressive') {
      // Try additional aggressive fixes
      fixed = this.aggressiveFixes(fixed, fixes);
      confidence -= fixes.length * 10;
    }

    // Try to parse the fixed JSON
    let parseResult = null;
    let isValid = false;

    try {
      parseResult = JSON.parse(fixed);
      isValid = true;
    } catch (e) {
      // Still invalid after all fixes
      confidence = Math.max(0, confidence - 30);
    }

    return {
      fixed_json: fixed,
      is_valid: isValid,
      fixes_applied: fixes,
      parse_result: parseResult,
      confidence: Math.max(0, Math.min(100, confidence)),
    };
  }

  /**
   * Remove comments from JSON
   */
  private removeComments(json: string): { result: string; changed: boolean } {
    let changed = false;
    let result = json;

    // Remove single-line comments
    const singleLinePattern = /\/\/[^\n]*/g;
    if (singleLinePattern.test(result)) {
      result = result.replace(singleLinePattern, '');
      changed = true;
    }

    // Remove multi-line comments
    const multiLinePattern = /\/\*[\s\S]*?\*\//g;
    if (multiLinePattern.test(result)) {
      result = result.replace(multiLinePattern, '');
      changed = true;
    }

    return { result, changed };
  }

  /**
   * Fix common JSON issues
   */
  private fixCommonIssues(json: string, fixes: Fix[]): string {
    let fixed = json;

    // Fix missing commas between array/object elements
    const missingCommaPattern = /([}\]"'\d])\s*[\n\r]\s*([{\["'])/g;
    if (missingCommaPattern.test(fixed)) {
      fixed = fixed.replace(missingCommaPattern, '$1,$2');
      fixes.push({
        type: 'add_comma',
        location: 'between elements',
        original: 'Missing commas',
        fixed: 'Added commas',
      });
    }

    // Fix trailing commas
    const trailingCommaPattern = /,(\s*[}\]])/g;
    if (trailingCommaPattern.test(fixed)) {
      fixed = fixed.replace(trailingCommaPattern, '$1');
      fixes.push({
        type: 'remove_trailing_comma',
        location: 'end of objects/arrays',
        original: 'Trailing commas',
        fixed: 'Removed trailing commas',
      });
    }

    // Fix single quotes to double quotes
    const singleQuotePattern = /'([^']*)'/g;
    if (singleQuotePattern.test(fixed)) {
      fixed = fixed.replace(singleQuotePattern, '"$1"');
      fixes.push({
        type: 'fix_quotes',
        location: 'string values',
        original: 'Single quotes',
        fixed: 'Double quotes',
      });
    }

    // Fix unquoted keys
    const unquotedKeyPattern = /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
    if (unquotedKeyPattern.test(fixed)) {
      fixed = fixed.replace(unquotedKeyPattern, '$1"$2":');
      fixes.push({
        type: 'quote_keys',
        location: 'object keys',
        original: 'Unquoted keys',
        fixed: 'Quoted keys',
      });
    }

    return fixed;
  }

  /**
   * Aggressive fixes for severely malformed JSON
   */
  private aggressiveFixes(json: string, fixes: Fix[]): string {
    let fixed = json;

    // Try to balance brackets
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;

    if (openBraces > closeBraces) {
      fixed += '}'.repeat(openBraces - closeBraces);
      fixes.push({
        type: 'balance_braces',
        location: 'end',
        original: `Missing ${openBraces - closeBraces} closing braces`,
        fixed: 'Added closing braces',
      });
    }

    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;

    if (openBrackets > closeBrackets) {
      fixed += ']'.repeat(openBrackets - closeBrackets);
      fixes.push({
        type: 'balance_brackets',
        location: 'end',
        original: `Missing ${openBrackets - closeBrackets} closing brackets`,
        fixed: 'Added closing brackets',
      });
    }

    return fixed;
  }
}
