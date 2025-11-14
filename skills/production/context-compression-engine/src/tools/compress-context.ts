import { CompressionEngine, CompressionOptions } from '../lib/compression-engine';

export async function run(input: any): Promise<any> {
  const engine = new CompressionEngine();

  const options: CompressionOptions = {
    target_reduction: input.target_reduction || 0.6,
    preservation_priority: input.preservation_priority || {
      recent_messages: 0.8,
      user_messages: 0.9,
      system_instructions: 1.0,
      facts_and_data: 0.7,
    },
    compression_strategy: input.compression_strategy || 'balanced',
    preserve_exact: input.preserve_exact,
  };

  return engine.compress(input.context, options);
}
