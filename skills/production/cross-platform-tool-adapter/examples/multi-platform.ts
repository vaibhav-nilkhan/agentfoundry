/**
 * Example: Write Once, Run Anywhere
 *
 * Define your tools once, use them across OpenAI, Anthropic, Bedrock, Cohere, Ollama
 */

import { adaptTools, Platform, CrossPlatformToolAdapter } from '../src';

// Define your tools ONCE (OpenAI format - the standard)
const weatherTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_current_weather',
      description: 'Get the current weather in a given location',
      parameters: {
        type: 'object' as const,
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature unit',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_forecast',
      description: 'Get weather forecast for the next N days',
      parameters: {
        type: 'object' as const,
        properties: {
          location: {
            type: 'string',
            description: 'Location for forecast',
          },
          days: {
            type: 'number',
            description: 'Number of days (1-10)',
          },
        },
        required: ['location', 'days'],
      },
    },
  },
];

console.log('=== Cross-Platform Tool Translation Demo ===\n');

// Translate to OpenAI (pass-through)
const openaiResult = adaptTools(weatherTools, Platform.OPENAI, 'auto');
console.log('✅ OpenAI format:');
console.log(`Tools: ${openaiResult.tools.length}`);
console.log(`tool_choice: ${openaiResult.tool_choice}\n`);

// Translate to Anthropic
const anthropicResult = adaptTools(weatherTools, Platform.ANTHROPIC, 'any');
console.log('✅ Anthropic format:');
console.log(`Tools: ${anthropicResult.tools.length}`);
console.log(`tool_choice: ${JSON.stringify(anthropicResult.tool_choice)}`);
console.log(`Warnings: ${anthropicResult.warnings?.length || 0}\n`);

// Translate to Bedrock
const bedrockResult = adaptTools(weatherTools, Platform.BEDROCK, {
  type: 'function',
  function: { name: 'get_current_weather' },
});
console.log('✅ Bedrock format:');
console.log(`Tools: ${bedrockResult.tools.length}`);
console.log(`tool_choice: ${JSON.stringify(bedrockResult.tool_choice)}\n`);

// Translate to Cohere
const cohereResult = adaptTools(weatherTools, Platform.COHERE, 'required');
console.log('✅ Cohere format:');
console.log(`Tools: ${cohereResult.tools.length}`);
console.log(`tool_choice: ${cohereResult.tool_choice}`);
console.log(`Warnings: ${cohereResult.warnings?.join(', ')}\n`);

// Translate to Ollama (with warnings)
const ollamaResult = adaptTools(weatherTools, Platform.OLLAMA);
console.log('✅ Ollama format:');
console.log(`Tools: ${ollamaResult.tools.length}`);
console.log(`tool_choice: ${ollamaResult.tool_choice || 'null (not supported)'}`);
console.log(`Warnings: ${ollamaResult.warnings?.join(', ')}`);
console.log(`Fallback applied: ${ollamaResult.fallback_applied}\n`);

// Auto-detection example
console.log('=== Auto-Detection Demo ===\n');

const adapter = new CrossPlatformToolAdapter({
  target_platform: Platform.OPENAI, // Will be overridden
});

const models = [
  'gpt-4-turbo',
  'claude-3-opus-20240229',
  'command-r-plus',
  'llama2',
  'deepseek-chat',
];

for (const model of models) {
  const result = adapter.autoTranslate(weatherTools, undefined, { model });
  console.log(`Model: ${model.padEnd(30)} → Platform: ${result.platform}`);
}

// Real-world scenario: Dynamic platform selection
console.log('\n=== Dynamic Platform Selection ===\n');

function callWeatherAPI(model: string, location: string) {
  // Auto-detect platform from model name
  const adapter = new CrossPlatformToolAdapter({
    target_platform: Platform.OPENAI,
  });

  const result = adapter.autoTranslate(weatherTools, 'auto', { model });

  console.log(`\nCalling ${result.platform} with ${model}:`);
  console.log(`- Location: ${location}`);
  console.log(`- Tools available: ${result.tools.length}`);
  console.log(`- Tool format: ${result.platform} native`);

  if (result.warnings && result.warnings.length > 0) {
    console.log(`⚠️  Warnings:`);
    result.warnings.forEach((w) => console.log(`   - ${w}`));
  }

  // Now use result.tools with the appropriate SDK
  return result;
}

callWeatherAPI('gpt-4-turbo', 'San Francisco, CA');
callWeatherAPI('claude-3-sonnet-20240229', 'New York, NY');
callWeatherAPI('llama2', 'Tokyo, JP');

console.log('\n✅ Same tools, 5+ platforms, zero manual translation!');
