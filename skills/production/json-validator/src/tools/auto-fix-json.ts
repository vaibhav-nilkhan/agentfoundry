import { JsonFixer, FixLevel } from '../lib/json-fixer';

interface AutoFixJsonInput {
  json_string: string;
  fix_level?: FixLevel;
  preserve_comments?: boolean;
}

export async function run(input: AutoFixJsonInput): Promise<any> {
  const fixer = new JsonFixer();

  const result = fixer.fix(
    input.json_string,
    input.fix_level || 'moderate',
    input.preserve_comments || false
  );

  return result;
}
