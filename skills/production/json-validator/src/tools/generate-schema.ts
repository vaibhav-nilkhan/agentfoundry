import { SchemaGenerator, SchemaOptions } from '../lib/schema-generator';

interface GenerateSchemaInput {
  examples: any[];
  schema_options?: Partial<SchemaOptions>;
}

export async function run(input: GenerateSchemaInput): Promise<any> {
  const generator = new SchemaGenerator();

  const options: SchemaOptions = {
    infer_required: input.schema_options?.infer_required ?? true,
    add_descriptions: input.schema_options?.add_descriptions ?? false,
    strict_types: input.schema_options?.strict_types ?? true,
    include_examples: input.schema_options?.include_examples ?? true,
  };

  try {
    const result = generator.generate(input.examples, options);
    return result;
  } catch (error: any) {
    return {
      schema: null,
      confidence: 0,
      analysis: {
        total_examples: input.examples.length,
        fields_found: 0,
        type_conflicts: [],
      },
      metadata: {
        generation_time_ms: 0,
        error: error.message,
      },
    };
  }
}
