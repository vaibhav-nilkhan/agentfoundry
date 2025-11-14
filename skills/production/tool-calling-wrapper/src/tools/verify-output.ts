import { SchemaValidator } from '../lib/schema-validator';

interface VerifyOutputInput {
  tool_name: string;
  tool_output: any;
  expected_schema: any;
  verification_rules?: Array<{
    rule_type: 'type_check' | 'range_check' | 'format_check' | 'custom';
    field: string;
    constraint: any;
  }>;
  auto_fix?: boolean;
  strict_mode?: boolean;
}

export async function run(input: VerifyOutputInput): Promise<any> {
  const validator = new SchemaValidator();

  // Validate against schema
  const validation = validator.validateJsonSchema(input.tool_output, input.expected_schema);

  const verification_errors = validation.validation_errors;
  let fixed_output = null;
  const fixes_applied: any[] = [];

  // Apply auto-fix if enabled and there are suggested fixes
  if (input.auto_fix && !validation.is_valid && validation.suggested_fixes.length > 0) {
    fixed_output = JSON.parse(JSON.stringify(input.tool_output));

    for (const fix of validation.suggested_fixes) {
      const fieldPath = fix.field.split('.');
      let current = fixed_output;

      // Navigate to the field
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }

      // Apply fix
      const lastField = fieldPath[fieldPath.length - 1];
      current[lastField] = fix.suggested_value;

      fixes_applied.push({
        field: fix.field,
        original_value: fix.current_value,
        fixed_value: fix.suggested_value,
        fix_type: fix.reason,
      });
    }
  }

  // Apply custom verification rules
  if (input.verification_rules) {
    for (const rule of input.verification_rules) {
      const ruleResult = applyVerificationRule(input.tool_output, rule);
      if (!ruleResult.passed) {
        verification_errors.push({
          field: rule.field,
          message: ruleResult.message,
          severity: input.strict_mode ? 'error' : 'warning',
        });
      }
    }
  }

  // Calculate confidence score
  const total_checks = verification_errors.length + (input.verification_rules?.length || 0);
  const failed_checks = verification_errors.length;
  const confidence_score = total_checks > 0 ? ((total_checks - failed_checks) / total_checks) * 100 : 100;

  return {
    is_valid: validation.is_valid && verification_errors.length === 0,
    verification_errors,
    fixed_output,
    fixes_applied,
    confidence_score,
    metadata: {
      total_checks,
      failed_checks,
      auto_fix_enabled: input.auto_fix || false,
    },
  };
}

function applyVerificationRule(output: any, rule: any): { passed: boolean; message: string } {
  // Extract field value
  const fieldPath = rule.field.split('.');
  let value = output;
  for (const part of fieldPath) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return { passed: false, message: `Field ${rule.field} not found` };
    }
  }

  switch (rule.rule_type) {
    case 'type_check':
      const expectedType = rule.constraint;
      const actualType = typeof value;
      if (actualType !== expectedType) {
        return {
          passed: false,
          message: `Expected type ${expectedType}, got ${actualType}`,
        };
      }
      break;

    case 'range_check':
      const { min, max } = rule.constraint;
      if (typeof value === 'number') {
        if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
          return {
            passed: false,
            message: `Value ${value} outside range [${min}, ${max}]`,
          };
        }
      }
      break;

    case 'format_check':
      const pattern = new RegExp(rule.constraint);
      if (!pattern.test(String(value))) {
        return {
          passed: false,
          message: `Value does not match format ${rule.constraint}`,
        };
      }
      break;

    case 'custom':
      // Custom rule evaluation would go here
      break;
  }

  return { passed: true, message: 'Rule passed' };
}
