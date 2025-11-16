/**
 * Example: Solving Issue #33855
 * Problem: tool_choice='any' inserted for Bedrock invocation causes error
 *
 * Before: tool_choice='any' → Bedrock API error
 * After: Automatically translated to {auto: {}} → Works!
 */

import { adaptTools, Platform } from '../src';

// Define your tool once (OpenAI format)
const myTools = [
  {
    type: 'function' as const,
    function: {
      name: 'search_database',
      description: 'Search the product database',
      parameters: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
          limit: {
            type: 'number',
            description: 'Max results',
          },
        },
        required: ['query'],
      },
    },
  },
];

// ❌ Before (breaks on Bedrock):
// const bedrockConfig = {
//   tools: myTools, // OpenAI format
//   tool_choice: 'any', // Incompatible with Bedrock!
// };
// → Error: Bedrock doesn't recognize tool_choice='any'

// ✅ After (works perfectly):
const result = adaptTools(myTools, Platform.BEDROCK, 'any');

console.log('Translated tools for Bedrock:');
console.log(JSON.stringify(result.tools, null, 2));
/*
[
  {
    "toolSpec": {
      "name": "search_database",
      "description": "Search the product database",
      "inputSchema": {
        "json": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            },
            "limit": {
              "type": "number",
              "description": "Max results"
            }
          },
          "required": ["query"]
        }
      }
    }
  }
]
*/

console.log('\nTranslated tool_choice:');
console.log(JSON.stringify(result.tool_choice, null, 2));
/*
{
  "auto": {}
}
*/

console.log('\nNow you can use this with Bedrock API without errors!');

// Use with AWS Bedrock SDK:
/*
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

const command = new ConverseCommand({
  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  messages: [
    {
      role: 'user',
      content: [{ text: 'Find products related to "laptop"' }],
    },
  ],
  toolConfig: {
    tools: result.tools, // ✅ Correctly formatted for Bedrock
    toolChoice: result.tool_choice, // ✅ {auto: {}} instead of 'any'
  },
});

const response = await client.send(command);
console.log('Bedrock response:', response);
*/
