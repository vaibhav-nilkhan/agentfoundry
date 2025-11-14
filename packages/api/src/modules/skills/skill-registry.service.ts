import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import * as yaml from 'js-yaml';

/**
 * Skill tool definition from manifest
 */
interface SkillTool {
  name: string;
  description: string;
  entry: string; // src/tools/detect-failure.ts
  input_schema: any;
  output_schema?: any;
}

/**
 * Skill manifest structure (skill.yaml)
 */
interface SkillManifest {
  schema_version: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  platforms: string[];
  tools: SkillTool[];
  dependencies?: {
    runtime?: Record<string, string>;
  };
  permissions?: string[];
  pricing?: any;
}

/**
 * Registered skill with compiled paths
 */
interface RegisteredSkill {
  slug: string;
  manifest: SkillManifest;
  skillPath: string; // /home/user/agentfoundry/skills/production/error-recovery-orchestrator
  tools: Map<string, RegisteredTool>;
}

/**
 * Registered tool with executable path
 */
interface RegisteredTool {
  name: string;
  description: string;
  modulePath: string; // /path/to/dist/tools/detect-failure.js
  inputSchema: any;
  outputSchema?: any;
}

@Injectable()
export class SkillRegistryService implements OnModuleInit {
  private readonly logger = new Logger(SkillRegistryService.name);
  private readonly skills = new Map<string, RegisteredSkill>();
  private readonly skillsBasePath = join(process.cwd(), '../../skills/production');

  async onModuleInit() {
    await this.loadAllSkills();
  }

  /**
   * Discover and load all skills from the production directory
   */
  private async loadAllSkills(): Promise<void> {
    try {
      this.logger.log(`Loading skills from: ${this.skillsBasePath}`);

      // Read all directories in skills/production
      const entries = await readdir(this.skillsBasePath, { withFileTypes: true });
      const skillDirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      this.logger.log(`Found ${skillDirs.length} potential skill directories`);

      // Load each skill
      for (const skillDir of skillDirs) {
        try {
          await this.loadSkill(skillDir);
        } catch (error: any) {
          this.logger.warn(`Failed to load skill ${skillDir}:`, error?.message || 'Unknown error');
        }
      }

      this.logger.log(`Successfully loaded ${this.skills.size} skills`);
    } catch (error) {
      this.logger.error('Failed to load skills:', error);
    }
  }

  /**
   * Load a single skill and its manifest
   */
  private async loadSkill(skillDirName: string): Promise<void> {
    const skillPath = join(this.skillsBasePath, skillDirName);
    const manifestPath = join(skillPath, 'skill.yaml');

    // Read and parse manifest
    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest = yaml.load(manifestContent) as SkillManifest;

    // Validate manifest
    if (!manifest.name || !manifest.tools || !Array.isArray(manifest.tools)) {
      throw new Error(`Invalid manifest for skill: ${skillDirName}`);
    }

    // Create slug from directory name
    const slug = skillDirName;

    // Load tools
    const tools = new Map<string, RegisteredTool>();
    for (const tool of manifest.tools) {
      const registeredTool = await this.loadTool(skillPath, tool);
      tools.set(tool.name, registeredTool);
    }

    // Register skill
    const registeredSkill: RegisteredSkill = {
      slug,
      manifest,
      skillPath,
      tools,
    };

    this.skills.set(slug, registeredSkill);

    this.logger.log(
      `Loaded skill: ${manifest.name} (${slug}) with ${tools.size} tools`
    );
  }

  /**
   * Load a single tool and resolve its module path
   */
  private async loadTool(
    skillPath: string,
    tool: SkillTool
  ): Promise<RegisteredTool> {
    // Convert src/tools/detect-failure.ts to dist/tools/detect-failure.js
    const distPath = tool.entry
      .replace(/^src\//, 'dist/')
      .replace(/\.ts$/, '.js');

    const modulePath = join(skillPath, distPath);

    return {
      name: tool.name,
      description: tool.description,
      modulePath,
      inputSchema: tool.input_schema,
      outputSchema: tool.output_schema,
    };
  }

  /**
   * Get a registered skill by slug
   */
  getSkill(slug: string): RegisteredSkill {
    const skill = this.skills.get(slug);
    if (!skill) {
      throw new NotFoundException(`Skill not found: ${slug}`);
    }
    return skill;
  }

  /**
   * Get a specific tool from a skill
   */
  getTool(skillSlug: string, toolName: string): RegisteredTool {
    const skill = this.getSkill(skillSlug);
    const tool = skill.tools.get(toolName);

    if (!tool) {
      throw new NotFoundException(
        `Tool '${toolName}' not found in skill '${skillSlug}'`
      );
    }

    return tool;
  }

  /**
   * Get all registered skills
   */
  getAllSkills(): RegisteredSkill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skill info for API responses
   */
  getSkillInfo(slug: string) {
    const skill = this.getSkill(slug);
    return {
      slug: skill.slug,
      name: skill.manifest.name,
      version: skill.manifest.version,
      description: skill.manifest.description,
      author: skill.manifest.author,
      platforms: skill.manifest.platforms,
      tools: Array.from(skill.tools.values()).map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
        output_schema: tool.outputSchema,
      })),
    };
  }

  /**
   * List all available skills
   */
  listSkills() {
    return this.getAllSkills().map((skill) => ({
      slug: skill.slug,
      name: skill.manifest.name,
      version: skill.manifest.version,
      description: skill.manifest.description,
      toolCount: skill.tools.size,
    }));
  }

  /**
   * Reload all skills (useful for development)
   */
  async reload(): Promise<void> {
    this.skills.clear();
    await this.loadAllSkills();
  }
}
