/**
 * Breaking Change Detector
 * Detects breaking changes between two OpenAPI specifications
 */

import { OpenAPISpec, SpecParser } from './spec-parser';

export interface BreakingChange {
  type: 'endpoint_removed' | 'field_removed' | 'type_changed' | 'new_required_field' | 'method_removed';
  severity: 'critical' | 'major' | 'minor';
  path: string;
  impact: string;
  remediation: string;
  oldValue?: string;
  newValue?: string;
}

export class BreakingChangeDetector {
  private parser: SpecParser;

  constructor() {
    this.parser = new SpecParser();
  }

  /**
   * Detect all breaking changes between two specs
   */
  async detectChanges(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): Promise<BreakingChange[]> {
    const changes: BreakingChange[] = [];

    // 1. Detect removed endpoints
    changes.push(...this.detectRemovedEndpoints(oldSpec, newSpec));

    // 2. Detect removed or modified fields
    changes.push(...this.detectFieldChanges(oldSpec, newSpec));

    // 3. Detect type changes
    changes.push(...this.detectTypeChanges(oldSpec, newSpec));

    // 4. Detect new required fields
    changes.push(...this.detectNewRequiredFields(oldSpec, newSpec));

    // 5. Detect removed HTTP methods
    changes.push(...this.detectRemovedMethods(oldSpec, newSpec));

    return changes;
  }

  /**
   * Detect removed endpoints
   */
  private detectRemovedEndpoints(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): BreakingChange[] {
    const changes: BreakingChange[] = [];
    const oldEndpoints = this.parser.getEndpoints(oldSpec);
    const newEndpoints = this.parser.getEndpoints(newSpec);

    for (const endpoint of oldEndpoints) {
      if (!newEndpoints.includes(endpoint)) {
        changes.push({
          type: 'endpoint_removed',
          severity: 'critical',
          path: endpoint,
          impact: `All consumers using ${endpoint} will break immediately`,
          remediation: `Restore endpoint ${endpoint} or provide a deprecated version with redirect`,
        });
      }
    }

    return changes;
  }

  /**
   * Detect removed or renamed fields in response schemas
   */
  private detectFieldChanges(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): BreakingChange[] {
    const changes: BreakingChange[] = [];
    const commonEndpoints = this.getCommonEndpoints(oldSpec, newSpec);

    for (const endpoint of commonEndpoints) {
      const oldOperations = this.parser.getOperations(oldSpec, endpoint);
      const newOperations = this.parser.getOperations(newSpec, endpoint);

      for (const { method, operation: oldOp } of oldOperations) {
        const newOp = newOperations.find(op => op.method === method);
        if (!newOp) continue;

        // Compare response schemas
        const oldSchema = this.parser.getResponseSchema(oldOp);
        const newSchema = this.parser.getResponseSchema(newOp.operation);

        if (oldSchema && newSchema) {
          const oldFields = this.parser.extractFields(oldSchema);
          const newFields = this.parser.extractFields(newSchema);

          for (const field of oldFields) {
            if (!newFields.includes(field)) {
              changes.push({
                type: 'field_removed',
                severity: 'major',
                path: `${method.toUpperCase()} ${endpoint}.${field}`,
                impact: `Consumers expecting the '${field}' field in the response will break`,
                remediation: `Restore field '${field}' or mark it as deprecated before removal`,
                oldValue: field,
              });
            }
          }
        }
      }
    }

    return changes;
  }

  /**
   * Detect type changes in fields
   */
  private detectTypeChanges(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): BreakingChange[] {
    const changes: BreakingChange[] = [];
    const commonEndpoints = this.getCommonEndpoints(oldSpec, newSpec);

    for (const endpoint of commonEndpoints) {
      const oldOperations = this.parser.getOperations(oldSpec, endpoint);
      const newOperations = this.parser.getOperations(newSpec, endpoint);

      for (const { method, operation: oldOp } of oldOperations) {
        const newOp = newOperations.find(op => op.method === method);
        if (!newOp) continue;

        const oldSchema = this.parser.getResponseSchema(oldOp);
        const newSchema = this.parser.getResponseSchema(newOp.operation);

        if (oldSchema && newSchema) {
          const commonFields = this.getCommonFields(oldSchema, newSchema);

          for (const field of commonFields) {
            const oldType = this.parser.getFieldType(oldSchema, field);
            const newType = this.parser.getFieldType(newSchema, field);

            if (oldType !== newType && !this.isCompatibleTypeChange(oldType, newType)) {
              changes.push({
                type: 'type_changed',
                severity: 'major',
                path: `${method.toUpperCase()} ${endpoint}.${field}`,
                impact: `Type changed from '${oldType}' to '${newType}', may break parsers`,
                remediation: `Revert type to '${oldType}' or provide conversion logic`,
                oldValue: oldType,
                newValue: newType,
              });
            }
          }
        }
      }
    }

    return changes;
  }

  /**
   * Detect new required fields
   */
  private detectNewRequiredFields(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): BreakingChange[] {
    const changes: BreakingChange[] = [];
    const commonEndpoints = this.getCommonEndpoints(oldSpec, newSpec);

    for (const endpoint of commonEndpoints) {
      const oldOperations = this.parser.getOperations(oldSpec, endpoint);
      const newOperations = this.parser.getOperations(newSpec, endpoint);

      for (const { method, operation: oldOp } of oldOperations) {
        const newOp = newOperations.find(op => op.method === method);
        if (!newOp) continue;

        // Check request body required fields
        const oldReqSchema = this.parser.getRequestBodySchema(oldOp);
        const newReqSchema = this.parser.getRequestBodySchema(newOp.operation);

        if (oldReqSchema && newReqSchema) {
          const oldRequired = this.parser.getRequiredFields(oldReqSchema);
          const newRequired = this.parser.getRequiredFields(newReqSchema);

          for (const field of newRequired) {
            if (!oldRequired.includes(field)) {
              changes.push({
                type: 'new_required_field',
                severity: 'major',
                path: `${method.toUpperCase()} ${endpoint} (request).${field}`,
                impact: `Requests without the '${field}' field will now fail validation`,
                remediation: `Make field '${field}' optional with a sensible default`,
                newValue: field,
              });
            }
          }
        }
      }
    }

    return changes;
  }

  /**
   * Detect removed HTTP methods
   */
  private detectRemovedMethods(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): BreakingChange[] {
    const changes: BreakingChange[] = [];
    const commonEndpoints = this.getCommonEndpoints(oldSpec, newSpec);

    for (const endpoint of commonEndpoints) {
      const oldOperations = this.parser.getOperations(oldSpec, endpoint);
      const newOperations = this.parser.getOperations(newSpec, endpoint);

      const oldMethods = oldOperations.map(op => op.method);
      const newMethods = newOperations.map(op => op.method);

      for (const method of oldMethods) {
        if (!newMethods.includes(method)) {
          changes.push({
            type: 'method_removed',
            severity: 'critical',
            path: `${method.toUpperCase()} ${endpoint}`,
            impact: `Consumers using ${method.toUpperCase()} on ${endpoint} will receive 405 errors`,
            remediation: `Restore ${method.toUpperCase()} method on ${endpoint}`,
            oldValue: method,
          });
        }
      }
    }

    return changes;
  }

  /**
   * Helper: Get endpoints that exist in both specs
   */
  private getCommonEndpoints(oldSpec: OpenAPISpec, newSpec: OpenAPISpec): string[] {
    const oldEndpoints = this.parser.getEndpoints(oldSpec);
    const newEndpoints = this.parser.getEndpoints(newSpec);
    return oldEndpoints.filter(ep => newEndpoints.includes(ep));
  }

  /**
   * Helper: Get fields that exist in both schemas
   */
  private getCommonFields(oldSchema: any, newSchema: any): string[] {
    const oldFields = this.parser.extractFields(oldSchema);
    const newFields = this.parser.extractFields(newSchema);
    return oldFields.filter(field => newFields.includes(field));
  }

  /**
   * Helper: Check if a type change is compatible
   */
  private isCompatibleTypeChange(oldType: string, newType: string): boolean {
    // Some type changes are backward compatible
    const compatibleChanges: Record<string, string[]> = {
      integer: ['number'], // integer -> number is compatible
      string: [], // string -> anything else is breaking
      number: [], // number -> anything else is breaking
      boolean: [], // boolean -> anything else is breaking
    };

    return compatibleChanges[oldType]?.includes(newType) || false;
  }
}
