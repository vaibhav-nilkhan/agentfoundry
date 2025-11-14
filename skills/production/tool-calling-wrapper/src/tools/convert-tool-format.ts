import { FrameworkConverter, Framework } from '../lib/framework-converter';

interface ConvertToolFormatInput {
  tool_definition: any;
  source_framework: Framework;
  target_framework: Framework;
  conversion_options?: {
    preserve_metadata?: boolean;
    strict_compatibility?: boolean;
    include_examples?: boolean;
    generate_tests?: boolean;
  };
}

export async function run(input: ConvertToolFormatInput): Promise<any> {
  const converter = new FrameworkConverter();

  try {
    const result = converter.convert(
      input.tool_definition,
      input.source_framework,
      input.target_framework,
      input.conversion_options || {}
    );

    return result;
  } catch (error: any) {
    return {
      converted_definition: null,
      conversion_warnings: [
        {
          feature: 'conversion',
          message: error.message,
          severity: 'error',
        },
      ],
      unsupported_features: [],
      compatibility_score: 0,
      migration_notes: [`Conversion failed: ${error.message}`],
      test_cases: [],
    };
  }
}
