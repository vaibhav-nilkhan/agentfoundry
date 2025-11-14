export interface SchemaOptions {
  infer_required: boolean;
  add_descriptions: boolean;
  strict_types: boolean;
  include_examples: boolean;
}

export interface SchemaGenerationResult {
  schema: any;
  confidence: number;
  analysis: {
    total_examples: number;
    fields_found: number;
    type_conflicts: TypeConflict[];
  };
  metadata: {
    generation_time_ms: number;
  };
}

export interface TypeConflict {
  field: string;
  types: string[];
  recommendation: string;
}

export class SchemaGenerator {
  /**
   * Generate JSON Schema from example objects
   */
  generate(examples: any[], options: SchemaOptions): SchemaGenerationResult {
    const startTime = Date.now();

    if (examples.length === 0) {
      throw new Error('At least one example is required');
    }

    // Analyze all examples
    const fieldTypes = new Map<string, Set<string>>();
    const fieldExamples = new Map<string, any[]>();
    const fieldFrequency = new Map<string, number>();

    for (const example of examples) {
      this.analyzeObject(example, '', fieldTypes, fieldExamples, fieldFrequency);
    }

    // Detect type conflicts
    const typeConflicts: TypeConflict[] = [];
    for (const [field, types] of fieldTypes.entries()) {
      if (types.size > 1) {
        typeConflicts.push({
          field,
          types: Array.from(types),
          recommendation: this.resolveTypeConflict(types),
        });
      }
    }

    // Build schema
    const schema: any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {},
    };

    if (options.infer_required) {
      schema.required = [];
    }

    // Generate properties
    for (const [field, types] of fieldTypes.entries()) {
      const frequency = fieldFrequency.get(field) || 0;
      const exampleValues = fieldExamples.get(field) || [];

      const propertySchema = this.generatePropertySchema(
        field,
        types,
        exampleValues,
        options
      );

      // Set property
      this.setNestedProperty(schema.properties, field, propertySchema);

      // Add to required if appears in all examples
      if (options.infer_required && frequency === examples.length) {
        const topLevelField = field.split('.')[0];
        if (!schema.required.includes(topLevelField)) {
          schema.required.push(topLevelField);
        }
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(
      examples.length,
      typeConflicts.length,
      fieldTypes.size
    );

    return {
      schema,
      confidence,
      analysis: {
        total_examples: examples.length,
        fields_found: fieldTypes.size,
        type_conflicts: typeConflicts,
      },
      metadata: {
        generation_time_ms: Date.now() - startTime,
      },
    };
  }

  /**
   * Recursively analyze object structure
   */
  private analyzeObject(
    obj: any,
    prefix: string,
    fieldTypes: Map<string, Set<string>>,
    fieldExamples: Map<string, any[]>,
    fieldFrequency: Map<string, number>
  ): void {
    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      // Analyze array elements
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          this.analyzeObject(item, prefix, fieldTypes, fieldExamples, fieldFrequency);
        }
      }
      return;
    }

    if (typeof obj !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const type = this.getType(value);

      // Track type
      if (!fieldTypes.has(fieldPath)) {
        fieldTypes.set(fieldPath, new Set());
      }
      fieldTypes.get(fieldPath)!.add(type);

      // Track examples
      if (!fieldExamples.has(fieldPath)) {
        fieldExamples.set(fieldPath, []);
      }
      fieldExamples.get(fieldPath)!.push(value);

      // Track frequency
      fieldFrequency.set(fieldPath, (fieldFrequency.get(fieldPath) || 0) + 1);

      // Recurse for nested objects
      if (type === 'object') {
        this.analyzeObject(value, fieldPath, fieldTypes, fieldExamples, fieldFrequency);
      }
    }
  }

  /**
   * Get JSON Schema type for value
   */
  private getType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';

    const type = typeof value;
    if (type === 'number') {
      return Number.isInteger(value) ? 'integer' : 'number';
    }

    return type;
  }

  /**
   * Resolve type conflict
   */
  private resolveTypeConflict(types: Set<string>): string {
    const typeArray = Array.from(types);

    // If null is one of the types, make it nullable
    if (typeArray.includes('null')) {
      const nonNullTypes = typeArray.filter(t => t !== 'null');
      if (nonNullTypes.length === 1) {
        return `Nullable ${nonNullTypes[0]}`;
      }
    }

    // If integer and number, use number
    if (typeArray.includes('integer') && typeArray.includes('number')) {
      return 'number';
    }

    // Default: use anyOf
    return `Use anyOf: [${typeArray.join(', ')}]`;
  }

  /**
   * Generate property schema
   */
  private generatePropertySchema(
    field: string,
    types: Set<string>,
    examples: any[],
    options: SchemaOptions
  ): any {
    const typeArray = Array.from(types);

    // Single type (most common)
    if (typeArray.length === 1) {
      const type = typeArray[0];
      const propertySchema: any = { type };

      if (options.add_descriptions) {
        propertySchema.description = `Field: ${field}`;
      }

      if (options.include_examples && examples.length > 0) {
        propertySchema.examples = examples.slice(0, 3);
      }

      // Add constraints based on type
      if (type === 'string') {
        const lengths = examples.map(e => String(e).length);
        if (options.strict_types) {
          propertySchema.minLength = Math.min(...lengths);
          propertySchema.maxLength = Math.max(...lengths);
        }
      }

      if (type === 'integer' || type === 'number') {
        const numbers = examples.filter(e => typeof e === 'number');
        if (options.strict_types && numbers.length > 0) {
          propertySchema.minimum = Math.min(...numbers);
          propertySchema.maximum = Math.max(...numbers);
        }
      }

      return propertySchema;
    }

    // Multiple types - use anyOf
    const propertySchema: any = {
      anyOf: typeArray.map(type => ({ type })),
    };

    if (options.add_descriptions) {
      propertySchema.description = `Field: ${field} (multiple types)`;
    }

    return propertySchema;
  }

  /**
   * Set nested property in schema
   */
  private setNestedProperty(properties: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = properties;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {
          type: 'object',
          properties: {},
        };
      }
      current = current[part].properties;
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    exampleCount: number,
    conflictCount: number,
    fieldCount: number
  ): number {
    let confidence = 100;

    // Reduce confidence for few examples
    if (exampleCount < 3) confidence -= 20;
    if (exampleCount < 5) confidence -= 10;

    // Reduce confidence for type conflicts
    confidence -= conflictCount * 15;

    // Reduce confidence for complex schemas
    if (fieldCount > 20) confidence -= 10;
    if (fieldCount > 50) confidence -= 20;

    return Math.max(0, Math.min(100, confidence));
  }
}
