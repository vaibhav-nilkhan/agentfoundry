/**
 * OpenAPI Specification Parser
 * Handles loading and parsing OpenAPI/Swagger specifications
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { OpenAPIV3 } from 'openapi-types';

export type OpenAPISpec = OpenAPIV3.Document;

export class SpecParser {
  /**
   * Load and parse an OpenAPI specification from URL or file path
   */
  async loadSpec(urlOrPath: string): Promise<OpenAPISpec> {
    try {
      let content: string;

      // Determine if it's a URL or file path
      if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
        // Fetch from URL
        const response = await axios.get(urlOrPath);
        content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      } else {
        // Read from file system
        content = await fs.readFile(urlOrPath, 'utf-8');
      }

      // Parse YAML or JSON
      let spec: any;
      try {
        spec = yaml.load(content);
      } catch {
        spec = JSON.parse(content);
      }

      // Validate and dereference the spec
      const validated = await SwaggerParser.validate(spec as any);
      const dereferenced = await SwaggerParser.dereference(validated);

      return dereferenced as OpenAPISpec;
    } catch (error: any) {
      throw new Error(`Failed to load OpenAPI spec from ${urlOrPath}: ${error.message}`);
    }
  }

  /**
   * Extract all endpoints from a spec
   */
  getEndpoints(spec: OpenAPISpec): string[] {
    if (!spec.paths) return [];
    return Object.keys(spec.paths);
  }

  /**
   * Get all operations for a given path
   */
  getOperations(spec: OpenAPISpec, path: string): Array<{ method: string; operation: OpenAPIV3.OperationObject }> {
    const pathItem = spec.paths?.[path];
    if (!pathItem) return [];

    const operations: Array<{ method: string; operation: OpenAPIV3.OperationObject }> = [];
    const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const;

    for (const method of methods) {
      const operation = pathItem[method];
      if (operation) {
        operations.push({ method, operation: operation as OpenAPIV3.OperationObject });
      }
    }

    return operations;
  }

  /**
   * Extract response schema for a successful response
   */
  getResponseSchema(operation: OpenAPIV3.OperationObject): any {
    const responses = operation.responses;
    if (!responses) return null;

    // Try common success status codes
    const successResponse = responses['200'] || responses['201'] || responses['204'];
    if (!successResponse) return null;

    const responseObj = successResponse as OpenAPIV3.ResponseObject;
    const content = responseObj.content;
    if (!content) return null;

    // Get JSON schema
    const jsonContent = content['application/json'];
    if (!jsonContent || !jsonContent.schema) return null;

    return jsonContent.schema;
  }

  /**
   * Extract request body schema
   */
  getRequestBodySchema(operation: OpenAPIV3.OperationObject): any {
    const requestBody = operation.requestBody;
    if (!requestBody) return null;

    const bodyObj = requestBody as OpenAPIV3.RequestBodyObject;
    const content = bodyObj.content;
    if (!content) return null;

    const jsonContent = content['application/json'];
    if (!jsonContent || !jsonContent.schema) return null;

    return jsonContent.schema;
  }

  /**
   * Extract all field names from a schema
   */
  extractFields(schema: any): string[] {
    if (!schema || !schema.properties) return [];
    return Object.keys(schema.properties);
  }

  /**
   * Get required fields from a schema
   */
  getRequiredFields(schema: any): string[] {
    if (!schema || !schema.required) return [];
    return schema.required;
  }

  /**
   * Get field type from schema
   */
  getFieldType(schema: any, fieldName: string): string {
    if (!schema || !schema.properties || !schema.properties[fieldName]) {
      return 'unknown';
    }
    const field = schema.properties[fieldName];
    return field.type || 'object';
  }
}
