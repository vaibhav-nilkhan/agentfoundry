/**
 * ClaudeAdapter - Converts AgentFoundry Skills to Claude Skills format
 */
import { Skill } from '../types';

export class ClaudeAdapter {
  /**
   * Convert a Skill to Claude Skills format
   */
  convert(skill: Skill): object {
    const { manifest, functions } = skill;

    // Claude Skills format (placeholder - will be updated when Claude Skills spec is finalized)
    return {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      permissions: manifest.permissions,
      tools: functions.map((fn) => ({
        name: fn.name,
        description: fn.description,
        input_schema: {
          type: 'object',
          properties: fn.parameters.reduce(
            (acc, param) => {
              acc[param.name] = {
                type: param.type,
                description: param.description,
              };
              return acc;
            },
            {} as Record<string, any>
          ),
          required: fn.parameters.filter((p) => p.required).map((p) => p.name),
        },
      })),
    };
  }
}
