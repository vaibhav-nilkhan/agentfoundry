import { JsonValidator } from '../lib/json-validator';
import { JsonFixer } from '../lib/json-fixer';

interface RetryWithSchemaInput {
  llm_call: {
    model: string;
    prompt: string;
    temperature?: number;
  };
  schema: any;
  invalid_output: string;
  max_retries?: number;
  enhance_prompt?: boolean;
}

interface AttemptLog {
  attempt: number;
  output: string;
  is_valid: boolean;
  errors: any[];
  timestamp: string;
}

export async function run(input: RetryWithSchemaInput): Promise<any> {
  const validator = new JsonValidator();
  const fixer = new JsonFixer();
  const maxRetries = input.max_retries || 3;
  const attemptLog: AttemptLog[] = [];

  let currentPrompt = input.llm_call.prompt;

  // Enhance prompt with schema guidance if requested
  if (input.enhance_prompt) {
    currentPrompt = enhancePromptWithSchema(currentPrompt, input.schema, input.invalid_output);
  }

  // Try to fix the initial invalid output
  const fixResult = fixer.fix(input.invalid_output, 'moderate');
  if (fixResult.is_valid) {
    const validation = validator.validate(fixResult.parse_result, input.schema);
    if (validation.is_valid) {
      return {
        success: true,
        valid_json: fixResult.parse_result,
        attempts: 1,
        attempt_log: [{
          attempt: 1,
          output: fixResult.fixed_json,
          is_valid: true,
          errors: [],
          timestamp: new Date().toISOString(),
        }],
        total_cost: 0, // No LLM call needed
      };
    }
  }

  // Simulate LLM retries (in production, this would call actual LLM API)
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // In production, this would be an actual LLM API call
    // For now, we'll simulate with a mock
    const llmOutput = await simulateLLMCall(currentPrompt, attempt);

    // Try to fix the output
    const attemptFix = fixer.fix(llmOutput, 'aggressive');

    // Validate
    let isValid = false;
    let errors: any[] = [];

    if (attemptFix.is_valid) {
      const validation = validator.validate(attemptFix.parse_result, input.schema);
      isValid = validation.is_valid;
      errors = validation.errors;

      if (isValid) {
        return {
          success: true,
          valid_json: attemptFix.parse_result,
          attempts: attempt,
          attempt_log: [
            ...attemptLog,
            {
              attempt,
              output: attemptFix.fixed_json,
              is_valid: true,
              errors: [],
              timestamp: new Date().toISOString(),
            },
          ],
          total_cost: estimateCost(currentPrompt, llmOutput, attempt),
        };
      }
    }

    attemptLog.push({
      attempt,
      output: llmOutput,
      is_valid: false,
      errors,
      timestamp: new Date().toISOString(),
    });

    // Enhance prompt for next retry with specific errors
    if (attempt < maxRetries && errors.length > 0) {
      currentPrompt = addErrorGuidance(currentPrompt, errors);
    }
  }

  // All retries failed
  return {
    success: false,
    valid_json: null,
    attempts: maxRetries,
    attempt_log: attemptLog,
    total_cost: estimateCost(currentPrompt, '', maxRetries),
  };
}

function enhancePromptWithSchema(prompt: string, schema: any, invalidOutput: string): string {
  return `${prompt}

IMPORTANT: You must return valid JSON that matches this exact schema:

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

Your previous output was invalid:
\`\`\`
${invalidOutput}
\`\`\`

Please ensure your response:
1. Is valid JSON (proper quotes, commas, brackets)
2. Matches all required fields in the schema
3. Uses correct data types for each field
4. Does not include additional properties not in the schema

Return ONLY the JSON object, nothing else.`;
}

function addErrorGuidance(prompt: string, errors: any[]): string {
  const errorMessages = errors.map(e => `- ${e.path}: ${e.message}`).join('\n');

  return `${prompt}

VALIDATION ERRORS from previous attempt:
${errorMessages}

Please fix these specific errors in your next response.`;
}

async function simulateLLMCall(prompt: string, attempt: number): Promise<string> {
  // This is a mock simulation for testing
  // In production, this would call actual LLM API (OpenAI, Anthropic, etc.)

  // Simulate getting better with each attempt
  if (attempt === 1) {
    return '{"status": "success", "data": {"id": 123}}'; // Valid JSON
  } else if (attempt === 2) {
    return '{"status": "success", "data": {"id": 456, "name": "Test"}}'; // Better JSON
  } else {
    return '{"status": "success", "data": {"id": 789, "name": "Test", "value": 42}}'; // Best JSON
  }
}

function estimateCost(prompt: string, output: string, attempts: number): number {
  // Rough token cost estimation (assuming GPT-4 pricing)
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(output.length / 4);

  const inputCostPerToken = 0.00003; // $0.03 per 1K tokens
  const outputCostPerToken = 0.00006; // $0.06 per 1K tokens

  return (inputTokens * inputCostPerToken + outputTokens * outputCostPerToken) * attempts;
}
