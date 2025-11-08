import { z } from 'zod';

/**
 * Input validation schema
 */
const inputSchema = z.object({
  input_param: z.string().min(1, 'Input parameter is required'),
});

/**
 * Output type definition
 */
interface ToolOutput {
  result: string;
  metadata?: Record<string, any>;
}

/**
 * My Tool - describe what it does
 *
 * @param input - Input parameters
 * @returns Tool output with result
 */
export async function run(input: z.infer<typeof inputSchema>): Promise<ToolOutput> {
  try {
    // Validate input
    const validated = inputSchema.parse(input);

    // TODO: Implement your tool logic here
    const result = `Processed: ${validated.input_param}`;

    // Return structured output
    return {
      result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  } catch (error) {
    // Handle errors gracefully
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}
