import axios, { AxiosError } from 'axios';
import { z } from 'zod';

/**
 * Input schema
 */
const inputSchema = z.object({
  query: z.string().min(1, 'Query is required'),
});

/**
 * API response type
 */
interface ApiResponse {
  data: any;
  status: number;
  headers?: Record<string, string>;
}

/**
 * Tool output
 */
interface ToolOutput {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    timestamp: string;
    query: string;
    cached?: boolean;
  };
}

/**
 * Fetch data from external API
 *
 * @param input - Input parameters
 * @returns API response data
 */
export async function run(input: z.infer<typeof inputSchema>): Promise<ToolOutput> {
  try {
    // Validate input
    const validated = inputSchema.parse(input);

    // Get API configuration from environment
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.API_BASE_URL || 'https://api.example.com';

    if (!apiKey) {
      throw new Error('API_KEY environment variable is required');
    }

    // Make API request
    const response = await axios.get(`${baseUrl}/data`, {
      params: {
        q: validated.query,
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    // Return successful response
    return {
      success: true,
      data: response.data,
      metadata: {
        timestamp: new Date().toISOString(),
        query: validated.query,
      },
    };
  } catch (error) {
    // Handle different error types
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }

    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      return {
        success: false,
        error: `API Error (${status}): ${message}`,
        metadata: {
          timestamp: new Date().toISOString(),
          query: input.query || '',
        },
      };
    }

    throw error;
  }
}
