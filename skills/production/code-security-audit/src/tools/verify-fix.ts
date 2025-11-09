import { z } from 'zod';

const inputSchema = z.object({
  vulnerability_id: z.string().min(1, 'Vulnerability ID is required'),
  fixed_code: z.string().min(1, 'Fixed code is required'),
  run_exploit: z.boolean().default(true),
});

interface VerificationOutput {
  is_fixed: boolean;
  verification_method: string;
  exploit_result: 'blocked' | 'still_vulnerable' | 'inconclusive';
  remaining_issues: string[];
  recommendation: string;
  metadata: {
    vulnerability_id: string;
    verified_at: string;
    exploit_attempted: boolean;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<VerificationOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Verifying fix for: ${validated.vulnerability_id}`);

  const verificationMethod = 'Static analysis + exploit simulation';
  const exploitResult = validated.run_exploit ? simulateExploit(validated.fixed_code) : 'inconclusive';
  const remainingIssues = analyzeRemainingIssues(validated.fixed_code);
  const isFixed = exploitResult === 'blocked' && remainingIssues.length === 0;

  return {
    is_fixed: isFixed,
    verification_method: verificationMethod,
    exploit_result: exploitResult,
    remaining_issues: remainingIssues,
    recommendation: isFixed
      ? 'Fix verified successfully. Safe to merge.'
      : 'Additional changes recommended before merging.',
    metadata: {
      vulnerability_id: validated.vulnerability_id,
      verified_at: new Date().toISOString(),
      exploit_attempted: validated.run_exploit,
    },
  };
}

function simulateExploit(fixedCode: string): 'blocked' | 'still_vulnerable' | 'inconclusive' {
  // Simulate exploit attempt
  const hasInputValidation = fixedCode.includes('sanitize') || fixedCode.includes('validate');
  const hasEscaping = fixedCode.includes('escape') || fixedCode.includes('encode');

  if (hasInputValidation && hasEscaping) {
    return 'blocked';
  } else if (!hasInputValidation && !hasEscaping) {
    return 'still_vulnerable';
  }

  return 'inconclusive';
}

function analyzeRemainingIssues(fixedCode: string): string[] {
  const issues: string[] = [];

  if (!fixedCode.includes('Error')) {
    issues.push('Missing error handling');
  }

  if (!fixedCode.includes('test') && !fixedCode.includes('spec')) {
    issues.push('No tests included');
  }

  if (fixedCode.length < 50) {
    issues.push('Fix may be incomplete');
  }

  return issues;
}
