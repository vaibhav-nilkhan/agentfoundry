export type Framework = 'langchain' | 'llamaindex' | 'mcp' | 'openai' | 'claude' | 'agentfoundry';

export interface ConversionResult {
  converted_definition: any;
  conversion_warnings: ConversionWarning[];
  unsupported_features: string[];
  compatibility_score: number;
  migration_notes: string[];
  test_cases: any[];
}

export interface ConversionWarning {
  feature: string;
  message: string;
  severity: string;
}

export class FrameworkConverter {
  /**
   * Convert tool definition between frameworks
   */
  convert(
    toolDefinition: any,
    sourceFramework: Framework,
    targetFramework: Framework,
    options: any = {}
  ): ConversionResult {
    // Parse source format
    const normalized = this.normalizeToolDefinition(toolDefinition, sourceFramework);

    // Convert to target format
    const converted = this.convertToTarget(normalized, targetFramework, options);

    // Check compatibility
    const compatibility = this.checkCompatibility(normalized, targetFramework);

    return {
      converted_definition: converted,
      conversion_warnings: compatibility.warnings,
      unsupported_features: compatibility.unsupported,
      compatibility_score: compatibility.score,
      migration_notes: this.generateMigrationNotes(sourceFramework, targetFramework),
      test_cases: options.generate_tests ? this.generateTestCases(converted) : [],
    };
  }

  /**
   * Normalize tool definition to common format
   */
  private normalizeToolDefinition(definition: any, framework: Framework): any {
    switch (framework) {
      case 'langchain':
        return this.normalizeLangChain(definition);
      case 'llamaindex':
        return this.normalizeLlamaIndex(definition);
      case 'mcp':
        return this.normalizeMCP(definition);
      case 'openai':
        return this.normalizeOpenAI(definition);
      case 'claude':
        return this.normalizeClaude(definition);
      case 'agentfoundry':
        return definition; // Already in standard format
      default:
        throw new Error(`Unsupported source framework: ${framework}`);
    }
  }

  /**
   * Convert from LangChain format
   */
  private normalizeLangChain(definition: any): any {
    return {
      name: definition.name,
      description: definition.description || '',
      input_schema: definition.args_schema || definition.schema,
      output_schema: {},
      metadata: {
        source_framework: 'langchain',
      },
    };
  }

  /**
   * Convert from LlamaIndex format
   */
  private normalizeLlamaIndex(definition: any): any {
    return {
      name: definition.metadata?.name || 'unnamed_tool',
      description: definition.metadata?.description || '',
      input_schema: definition.fn_schema || {},
      output_schema: {},
      metadata: {
        source_framework: 'llamaindex',
      },
    };
  }

  /**
   * Convert from MCP format
   */
  private normalizeMCP(definition: any): any {
    return {
      name: definition.name,
      description: definition.description || '',
      input_schema: definition.inputSchema || {},
      output_schema: {},
      metadata: {
        source_framework: 'mcp',
      },
    };
  }

  /**
   * Convert from OpenAI format
   */
  private normalizeOpenAI(definition: any): any {
    return {
      name: definition.function?.name || definition.name,
      description: definition.function?.description || definition.description || '',
      input_schema: definition.function?.parameters || definition.parameters || {},
      output_schema: {},
      metadata: {
        source_framework: 'openai',
      },
    };
  }

  /**
   * Convert from Claude format
   */
  private normalizeClaude(definition: any): any {
    return {
      name: definition.name,
      description: definition.description || '',
      input_schema: definition.input_schema || {},
      output_schema: {},
      metadata: {
        source_framework: 'claude',
      },
    };
  }

  /**
   * Convert normalized definition to target framework
   */
  private convertToTarget(normalized: any, framework: Framework, options: any): any {
    switch (framework) {
      case 'langchain':
        return this.convertToLangChain(normalized);
      case 'llamaindex':
        return this.convertToLlamaIndex(normalized);
      case 'mcp':
        return this.convertToMCP(normalized);
      case 'openai':
        return this.convertToOpenAI(normalized);
      case 'claude':
        return this.convertToClaude(normalized);
      case 'agentfoundry':
        return normalized;
      default:
        throw new Error(`Unsupported target framework: ${framework}`);
    }
  }

  /**
   * Convert to LangChain format
   */
  private convertToLangChain(normalized: any): any {
    return {
      name: normalized.name,
      description: normalized.description,
      args_schema: normalized.input_schema,
    };
  }

  /**
   * Convert to LlamaIndex format
   */
  private convertToLlamaIndex(normalized: any): any {
    return {
      metadata: {
        name: normalized.name,
        description: normalized.description,
      },
      fn_schema: normalized.input_schema,
    };
  }

  /**
   * Convert to MCP format
   */
  private convertToMCP(normalized: any): any {
    return {
      name: normalized.name,
      description: normalized.description,
      inputSchema: normalized.input_schema,
    };
  }

  /**
   * Convert to OpenAI format
   */
  private convertToOpenAI(normalized: any): any {
    return {
      type: 'function',
      function: {
        name: normalized.name,
        description: normalized.description,
        parameters: normalized.input_schema,
      },
    };
  }

  /**
   * Convert to Claude format
   */
  private convertToClaude(normalized: any): any {
    return {
      name: normalized.name,
      description: normalized.description,
      input_schema: normalized.input_schema,
    };
  }

  /**
   * Check compatibility between frameworks
   */
  private checkCompatibility(normalized: any, targetFramework: Framework): {
    warnings: ConversionWarning[];
    unsupported: string[];
    score: number;
  } {
    const warnings: ConversionWarning[] = [];
    const unsupported: string[] = [];

    // Framework-specific compatibility checks
    if (targetFramework === 'openai') {
      if (normalized.output_schema) {
        warnings.push({
          feature: 'output_schema',
          message: 'OpenAI does not support output schema validation',
          severity: 'warning',
        });
      }
    }

    // Calculate compatibility score
    const score = 100 - (warnings.length * 10) - (unsupported.length * 20);

    return {
      warnings,
      unsupported,
      score: Math.max(0, score),
    };
  }

  /**
   * Generate migration notes
   */
  private generateMigrationNotes(source: Framework, target: Framework): string[] {
    const notes: string[] = [];

    notes.push(`Converting from ${source} to ${target} format`);

    if (target === 'langchain') {
      notes.push('LangChain tools use args_schema for input validation');
      notes.push('Consider using BaseModel for complex input types');
    }

    if (target === 'openai') {
      notes.push('OpenAI function calling requires JSON Schema format');
      notes.push('All parameters must be in parameters.properties');
    }

    return notes;
  }

  /**
   * Generate test cases
   */
  private generateTestCases(converted: any): any[] {
    return [
      {
        name: 'Basic execution test',
        input: {},
        expected_output: null,
      },
    ];
  }
}
