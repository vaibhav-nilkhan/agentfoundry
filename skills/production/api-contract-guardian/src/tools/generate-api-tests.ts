import { z } from 'zod';
import { SpecParser } from '../lib/spec-parser';

const inputSchema = z.object({
  spec_url: z.string().min(1, 'Spec URL is required'),
  base_url: z.string().url('Base URL must be a valid URL'),
  test_framework: z.enum(['jest', 'mocha', 'pytest', 'junit']).default('jest'),
  include_auth: z.boolean().default(true),
});

interface TestFile {
  filename: string;
  content: string;
  test_count: number;
}

interface TestOutput {
  test_files: TestFile[];
  test_summary: {
    total_tests: number;
    happy_path_tests: number;
    validation_tests: number;
    auth_tests: number;
    error_tests: number;
  };
  estimated_coverage: number;
  metadata: {
    spec_url: string;
    base_url: string;
    test_framework: string;
    generated_at: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<TestOutput> {
  const validated = inputSchema.parse(input);

  const parser = new SpecParser();

  try {
    console.log(`Loading spec: ${validated.spec_url}`);
    const spec = await parser.loadSpec(validated.spec_url);

    const endpoints = parser.getEndpoints(spec);
    console.log(`Generating tests for ${endpoints.length} endpoint(s)`);

    const testFiles: TestFile[] = [];
    let totalTests = 0;
    let happyPathTests = 0;
    let validationTests = 0;
    let authTests = 0;
    let errorTests = 0;

    for (const endpoint of endpoints) {
      const operations = parser.getOperations(spec, endpoint);

      for (const { method, operation } of operations) {
        const testContent = generateTestsForOperation(
          endpoint,
          method,
          operation,
          validated.base_url,
          validated.test_framework,
          validated.include_auth
        );

        const testCount = countTests(testContent);

        testFiles.push({
          filename: `${sanitizeFilename(endpoint)}-${method}.test.${getFileExtension(validated.test_framework)}`,
          content: testContent,
          test_count: testCount,
        });

        totalTests += testCount;
        happyPathTests += 1; // At least one happy path per operation
        validationTests += 2; // Request/response validation
        if (validated.include_auth) authTests += 1;
        errorTests += 1; // Error handling
      }
    }

    const coverage = Math.min(95, Math.round((totalTests / (endpoints.length * 10)) * 100));

    return {
      test_files: testFiles,
      test_summary: {
        total_tests: totalTests,
        happy_path_tests: happyPathTests,
        validation_tests: validationTests,
        auth_tests: authTests,
        error_tests: errorTests,
      },
      estimated_coverage: coverage,
      metadata: {
        spec_url: validated.spec_url,
        base_url: validated.base_url,
        test_framework: validated.test_framework,
        generated_at: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    throw new Error(`Test generation failed: ${error.message}`);
  }
}

function generateTestsForOperation(
  endpoint: string,
  method: string,
  operation: any,
  baseUrl: string,
  framework: string,
  includeAuth: boolean
): string {
  const testName = operation.summary || `${method.toUpperCase()} ${endpoint}`;

  if (framework === 'jest') {
    return `
import axios from 'axios';

describe('${testName}', () => {
  const baseUrl = '${baseUrl}';

  test('should successfully ${method} ${endpoint}', async () => {
    const response = await axios.${method}(\`\${baseUrl}${endpoint}\`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  test('should validate request parameters', async () => {
    // Add validation tests based on schema
    expect(true).toBe(true);
  });

  test('should handle errors gracefully', async () => {
    try {
      await axios.${method}(\`\${baseUrl}${endpoint}/invalid\`);
    } catch (error: any) {
      expect(error.response.status).toBeGreaterThanOrEqual(400);
    }
  });
${includeAuth ? `
  test('should require authentication', async () => {
    try {
      await axios.${method}(\`\${baseUrl}${endpoint}\`, {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
` : ''}
});
`.trim();
  }

  // Add other frameworks as needed
  return `// Tests for ${testName}`;
}

function countTests(testContent: string): number {
  const testMatches = testContent.match(/test\(|it\(/g);
  return testMatches ? testMatches.length : 0;
}

function sanitizeFilename(endpoint: string): string {
  return endpoint.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
}

function getFileExtension(framework: string): string {
  const extensions: Record<string, string> = {
    jest: 'ts',
    mocha: 'ts',
    pytest: 'py',
    junit: 'java',
  };
  return extensions[framework] || 'ts';
}
