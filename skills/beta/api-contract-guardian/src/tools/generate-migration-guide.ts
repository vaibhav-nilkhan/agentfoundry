import { z } from 'zod';
import { BreakingChange } from '../lib/breaking-change-detector';

const inputSchema = z.object({
  old_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Old version must be semver'),
  new_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'New version must be semver'),
  breaking_changes: z.array(z.any()).min(1, 'At least one breaking change is required'),
  format: z.enum(['markdown', 'html', 'pdf']).default('markdown'),
});

interface MigrationTask {
  task: string;
  priority: 'high' | 'medium' | 'low';
  estimated_time: string;
}

interface CodeExample {
  title: string;
  before: string;
  after: string;
  language: string;
}

interface MigrationGuideOutput {
  migration_guide: string;
  checklist: MigrationTask[];
  code_examples: CodeExample[];
  metadata: {
    old_version: string;
    new_version: string;
    format: string;
    generated_at: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<MigrationGuideOutput> {
  const validated = inputSchema.parse(input);

  const changes = validated.breaking_changes as BreakingChange[];

  console.log(`Generating migration guide from v${validated.old_version} to v${validated.new_version}`);

  // Generate checklist
  const checklist = generateChecklist(changes);

  // Generate code examples
  const codeExamples = generateCodeExamples(changes);

  // Generate full migration guide
  const migrationGuide = generateFullGuide(
    validated.old_version,
    validated.new_version,
    changes,
    checklist,
    codeExamples,
    validated.format
  );

  return {
    migration_guide: migrationGuide,
    checklist,
    code_examples: codeExamples,
    metadata: {
      old_version: validated.old_version,
      new_version: validated.new_version,
      format: validated.format,
      generated_at: new Date().toISOString(),
    },
  };
}

function generateChecklist(changes: BreakingChange[]): MigrationTask[] {
  const tasks: MigrationTask[] = [];

  // Group changes by type
  const byType = new Map<string, BreakingChange[]>();
  for (const change of changes) {
    if (!byType.has(change.type)) {
      byType.set(change.type, []);
    }
    byType.get(change.type)!.push(change);
  }

  // Generate tasks for each type
  for (const [type, typeChanges] of byType.entries()) {
    const priority = typeChanges.some(c => c.severity === 'critical') ? 'high' :
                     typeChanges.some(c => c.severity === 'major') ? 'medium' : 'low';

    const estimatedTime = `${typeChanges.length * 30} minutes`;

    switch (type) {
      case 'endpoint_removed':
        tasks.push({
          task: `Update code to remove calls to ${typeChanges.length} removed endpoint(s)`,
          priority,
          estimated_time: estimatedTime,
        });
        break;

      case 'field_removed':
        tasks.push({
          task: `Remove dependencies on ${typeChanges.length} removed field(s)`,
          priority,
          estimated_time: estimatedTime,
        });
        break;

      case 'type_changed':
        tasks.push({
          task: `Update parsers/validators for ${typeChanges.length} field type change(s)`,
          priority,
          estimated_time: estimatedTime,
        });
        break;

      case 'new_required_field':
        tasks.push({
          task: `Add ${typeChanges.length} new required field(s) to requests`,
          priority,
          estimated_time: estimatedTime,
        });
        break;

      case 'method_removed':
        tasks.push({
          task: `Switch to alternative methods for ${typeChanges.length} removed HTTP method(s)`,
          priority,
          estimated_time: estimatedTime,
        });
        break;
    }
  }

  // Add standard tasks
  tasks.push(
    {
      task: 'Run integration tests against new API version',
      priority: 'high',
      estimated_time: '2 hours',
    },
    {
      task: 'Update API documentation and examples',
      priority: 'medium',
      estimated_time: '1 hour',
    },
    {
      task: 'Notify team members of API changes',
      priority: 'high',
      estimated_time: '30 minutes',
    }
  );

  return tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function generateCodeExamples(changes: BreakingChange[]): CodeExample[] {
  const examples: CodeExample[] = [];

  for (const change of changes.slice(0, 5)) { // Limit to 5 examples
    switch (change.type) {
      case 'field_removed':
        examples.push({
          title: `Field Removed: ${change.path}`,
          before: `
const response = await api.get('${extractEndpoint(change.path)}');
const value = response.data.${change.oldValue};
console.log(value); // This field no longer exists
          `.trim(),
          after: `
const response = await api.get('${extractEndpoint(change.path)}');
// Field '${change.oldValue}' has been removed
// Use alternative field or endpoint
          `.trim(),
          language: 'typescript',
        });
        break;

      case 'type_changed':
        examples.push({
          title: `Type Changed: ${change.path}`,
          before: `
// Old type: ${change.oldValue}
const value: ${change.oldValue} = response.data.field;
          `.trim(),
          after: `
// New type: ${change.newValue}
const value: ${change.newValue} = response.data.field;
// Update parsers and validators accordingly
          `.trim(),
          language: 'typescript',
        });
        break;

      case 'new_required_field':
        examples.push({
          title: `New Required Field: ${change.newValue}`,
          before: `
const response = await api.post('/endpoint', {
  // Missing required field: ${change.newValue}
});
          `.trim(),
          after: `
const response = await api.post('/endpoint', {
  ${change.newValue}: 'value', // Now required
  // ... other fields
});
          `.trim(),
          language: 'typescript',
        });
        break;
    }
  }

  return examples;
}

function generateFullGuide(
  oldVersion: string,
  newVersion: string,
  changes: BreakingChange[],
  checklist: MigrationTask[],
  codeExamples: CodeExample[],
  format: string
): string {
  if (format === 'markdown') {
    return `
# API Migration Guide: v${oldVersion} → v${newVersion}

## Overview

This guide helps you migrate from API version ${oldVersion} to ${newVersion}.

**Total Breaking Changes:** ${changes.length}
- Critical: ${changes.filter(c => c.severity === 'critical').length}
- Major: ${changes.filter(c => c.severity === 'major').length}
- Minor: ${changes.filter(c => c.severity === 'minor').length}

## Migration Checklist

${checklist.map((task, i) => `
${i + 1}. **[${task.priority.toUpperCase()}]** ${task.task}
   - Estimated time: ${task.estimated_time}
`).join('\n')}

## Breaking Changes

${changes.map((change, i) => `
### ${i + 1}. ${change.type.replace(/_/g, ' ').toUpperCase()}

- **Path:** \`${change.path}\`
- **Severity:** ${change.severity}
- **Impact:** ${change.impact}
- **Remediation:** ${change.remediation}
${change.oldValue ? `- **Old Value:** \`${change.oldValue}\`` : ''}
${change.newValue ? `- **New Value:** \`${change.newValue}\`` : ''}
`).join('\n')}

## Code Examples

${codeExamples.map((example, i) => `
### Example ${i + 1}: ${example.title}

**Before (v${oldVersion}):**
\`\`\`${example.language}
${example.before}
\`\`\`

**After (v${newVersion}):**
\`\`\`${example.language}
${example.after}
\`\`\`
`).join('\n')}

## Testing Your Migration

1. Update your codebase according to the checklist
2. Run your test suite against the new API version
3. Test edge cases and error handling
4. Verify all integrations work correctly

## Getting Help

If you encounter issues during migration:
- Check the API documentation
- Review the changelog
- Contact support team

---

**Generated:** ${new Date().toISOString()}
    `.trim();
  }

  // For HTML/PDF, return a simple version
  return `Migration guide for v${oldVersion} to v${newVersion} (${changes.length} changes)`;
}

function extractEndpoint(path: string): string {
  const match = path.match(/([A-Z]+\s+)?([^\s.]+)/);
  return match ? match[2] : path;
}
