/**
 * GPTAdapter - Converts AgentFoundry Skills to GPT Actions format
 */
import { Skill } from '../types';

export class GPTAdapter {
  /**
   * Convert a Skill to GPT Actions format (OpenAPI schema)
   */
  convert(skill: Skill): object {
    const { manifest, functions } = skill;

    // OpenAPI 3.0 format for GPT Actions
    return {
      openapi: '3.0.0',
      info: {
        title: manifest.name,
        version: manifest.version,
        description: manifest.description,
      },
      paths: functions.reduce(
        (acc, fn) => {
          acc[`/${fn.name}`] = {
            post: {
              operationId: fn.name,
              summary: fn.description,
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: fn.parameters.reduce(
                        (props, param) => {
                          props[param.name] = {
                            type: param.type,
                            description: param.description,
                          };
                          return props;
                        },
                        {} as Record<string, any>
                      ),
                      required: fn.parameters.filter((p) => p.required).map((p) => p.name),
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Successful response',
                },
              },
            },
          };
          return acc;
        },
        {} as Record<string, any>
      ),
    };
  }
}
