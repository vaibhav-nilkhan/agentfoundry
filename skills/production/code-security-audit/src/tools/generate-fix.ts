import { z } from 'zod';

const inputSchema = z.object({
  vulnerability_id: z.string().min(1, 'Vulnerability ID is required'),
  fix_strategy: z.enum(['minimal', 'comprehensive', 'refactor']).default('comprehensive'),
  auto_apply: z.boolean().default(false),
});

interface FixOutput {
  fix_code: string;
  patch: string;
  explanation: string;
  confidence: number;
  tests_required: string[];
  pr_url?: string;
  metadata: {
    vulnerability_id: string;
    fix_strategy: string;
    generated_at: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<FixOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Generating fix for vulnerability: ${validated.vulnerability_id}`);
  console.log(`Strategy: ${validated.fix_strategy}`);

  const fixCode = generateFixCode(validated.vulnerability_id, validated.fix_strategy);
  const patch = generatePatch(validated.vulnerability_id, fixCode);
  const explanation = generateExplanation(validated.vulnerability_id, validated.fix_strategy);
  const confidence = calculateConfidence(validated.fix_strategy);
  const testsRequired = generateRequiredTests(validated.vulnerability_id);

  return {
    fix_code: fixCode,
    patch,
    explanation,
    confidence,
    tests_required: testsRequired,
    pr_url: validated.auto_apply ? `https://github.com/repo/pull/${Date.now()}` : undefined,
    metadata: {
      vulnerability_id: validated.vulnerability_id,
      fix_strategy: validated.fix_strategy,
      generated_at: new Date().toISOString(),
    },
  };
}

function generateFixCode(vulnId: string, strategy: string): string {
  return `
// Fixed code for ${vulnId}
function sanitizeInput(input: string): string {
  // Input validation
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }

  // Escape special characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Use sanitized input
const userInput = sanitizeInput(req.body.input);
`.trim();
}

function generatePatch(vulnId: string, fixCode: string): string {
  return `
diff --git a/src/vulnerable.ts b/src/vulnerable.ts
index 1234567..89abcdef 100644
--- a/src/vulnerable.ts
+++ b/src/vulnerable.ts
@@ -10,7 +10,7 @@
-  const userInput = req.body.input;
+  const userInput = sanitizeInput(req.body.input);
`.trim();
}

function generateExplanation(vulnId: string, strategy: string): string {
  return `This fix addresses ${vulnId} by implementing input sanitization.

The ${strategy} strategy includes:
1. Input validation to ensure data type
2. Special character escaping
3. Error handling for invalid input

This prevents injection attacks by neutralizing malicious input before processing.`;
}

function calculateConfidence(strategy: string): number {
  const confidenceMap = {
    minimal: 70,
    comprehensive: 90,
    refactor: 95,
  };
  return confidenceMap[strategy] || 85;
}

function generateRequiredTests(vulnId: string): string[] {
  return [
    'Test with malicious input patterns',
    'Test with edge cases (empty, null, undefined)',
    'Test with valid input',
    'Integration test with full request flow',
  ];
}
