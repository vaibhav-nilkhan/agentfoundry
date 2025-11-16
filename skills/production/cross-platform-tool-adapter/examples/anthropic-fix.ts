/**
 * Example: Solving llama-index Issue #19212
 * Problem: Not getting the tool calling parameters for anthropic models
 *
 * Before: Tool parameters missing or incorrectly formatted
 * After: All parameters correctly translated to Anthropic's input_schema format
 */

import { adaptTools, Platform } from '../src';

// Define your tool (OpenAI format)
const calculatorTool = {
  type: 'function' as const,
  function: {
    name: 'calculate',
    description: 'Perform mathematical calculations',
    parameters: {
      type: 'object' as const,
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate (e.g., "2 + 2")',
        },
        precision: {
          type: 'number',
          description: 'Number of decimal places',
        },
      },
      required: ['expression'],
    },
  },
};

// ❌ Before (llama_index users reported missing parameters):
// Anthropic client expects:
// {
//   name: 'calculate',
//   input_schema: { ... }
// }
// But got incomplete or wrong format

// ✅ After (all parameters correctly present):
const result = adaptTools([calculatorTool], Platform.ANTHROPIC, 'auto');

console.log('Translated tool for Anthropic:');
console.log(JSON.stringify(result.tools[0], null, 2));
/*
{
  "name": "calculate",
  "description": "Perform mathematical calculations",
  "input_schema": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "Mathematical expression to evaluate (e.g., \"2 + 2\")"
      },
      "precision": {
        "type": "number",
        "description": "Number of decimal places"
      }
    },
    "required": ["expression"]
  }
}
*/

console.log('\nTranslated tool_choice:');
console.log(JSON.stringify(result.tool_choice, null, 2));
/*
{
  "type": "auto"
}
*/

// Use with Anthropic SDK:
/*
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await client.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: 'What is 15% of 250?',
    },
  ],
  tools: result.tools, // ✅ All parameters correctly formatted
  tool_choice: result.tool_choice, // ✅ {type: 'auto'}
});

console.log('Anthropic response:', message);

// Tool will be called with correct parameter structure:
if (message.stop_reason === 'tool_use') {
  const toolUse = message.content.find((block) => block.type === 'tool_use');
  console.log('Tool called:', toolUse.name);
  console.log('Parameters received:', toolUse.input);
  // {expression: '15% of 250', precision: undefined}
}
*/

console.log('\n✅ All tool parameters are now correctly passed to Anthropic!');
