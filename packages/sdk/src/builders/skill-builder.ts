/**
 * SkillBuilder - Fluent API for building AgentFoundry Skills
 */
import { Skill, SkillManifest, SkillFunction, Platform, PricingType } from '../types';

export class SkillBuilder {
  private manifest: Partial<SkillManifest> = {
    platforms: [Platform.MCP],
    permissions: [],
    pricingType: PricingType.FREE,
  };
  private functions: SkillFunction[] = [];

  /**
   * Set the Skill name
   */
  name(name: string): this {
    this.manifest.name = name;
    return this;
  }

  /**
   * Set the Skill version
   */
  version(version: string): this {
    this.manifest.version = version;
    return this;
  }

  /**
   * Set the Skill description
   */
  description(description: string): this {
    this.manifest.description = description;
    return this;
  }

  /**
   * Set the author
   */
  author(author: string): this {
    this.manifest.author = author;
    return this;
  }

  /**
   * Add supported platforms
   */
  platforms(...platforms: Platform[]): this {
    this.manifest.platforms = platforms;
    return this;
  }

  /**
   * Add required permissions
   */
  permissions(...permissions: string[]): this {
    this.manifest.permissions = [...(this.manifest.permissions || []), ...permissions];
    return this;
  }

  /**
   * Set category and tags
   */
  categorize(category: string, tags: string[]): this {
    this.manifest.category = category;
    this.manifest.tags = tags;
    return this;
  }

  /**
   * Set pricing
   */
  pricing(type: PricingType, price?: number): this {
    this.manifest.pricingType = type;
    this.manifest.price = price;
    return this;
  }

  /**
   * Add a function to the Skill
   */
  addFunction(fn: SkillFunction): this {
    this.functions.push(fn);
    return this;
  }

  /**
   * Build and validate the Skill
   */
  build(): Skill {
    // Validate required fields
    if (!this.manifest.name) {
      throw new Error('Skill name is required');
    }
    if (!this.manifest.version) {
      throw new Error('Skill version is required');
    }
    if (!this.manifest.description) {
      throw new Error('Skill description is required');
    }
    if (!this.manifest.author) {
      throw new Error('Skill author is required');
    }

    return {
      manifest: this.manifest as SkillManifest,
      functions: this.functions,
    };
  }

  /**
   * Export to .claudeskill.md format
   */
  toClaudeSkill(): string {
    const skill = this.build();
    const { manifest, functions } = skill;

    let output = `# ${manifest.name}\n\n`;
    output += `**Version**: ${manifest.version}\n`;
    output += `**Author**: ${manifest.author}\n\n`;
    output += `## Description\n\n${manifest.description}\n\n`;

    if (manifest.permissions && manifest.permissions.length > 0) {
      output += `## Permissions\n\n`;
      manifest.permissions.forEach((perm) => {
        output += `- ${perm}\n`;
      });
      output += '\n';
    }

    output += `## Functions\n\n`;
    functions.forEach((fn) => {
      output += `### ${fn.name}\n\n`;
      output += `${fn.description}\n\n`;
      output += `**Parameters:**\n\n`;
      fn.parameters.forEach((param) => {
        output += `- \`${param.name}\` (${param.type}${param.required ? ', required' : ''}): ${param.description}\n`;
      });
      output += '\n';
    });

    return output;
  }
}
