import { JsonValidator } from '../lib/json-validator';

interface ValidateJsonInput {
  json_data: any;
  schema: any;
  strict_mode?: boolean;
  include_suggestions?: boolean;
}

export async function run(input: ValidateJsonInput): Promise<any> {
  const validator = new JsonValidator();

  const result = validator.validate(
    input.json_data,
    input.schema,
    input.strict_mode || false
  );

  // Remove suggestions if not requested
  if (!input.include_suggestions) {
    delete (result as any).suggestions;
  }

  return result;
}
