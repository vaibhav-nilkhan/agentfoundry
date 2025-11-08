/**
 * Skill Loader
 * Loads AgentFoundry Skills from file system
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import { AgentForgeSkill, SkillMetadata } from './types.js';

export class SkillLoader {
  /**
   * Load a Skill from a directory
   */
  static async loadSkill(skillPath: string): Promise<AgentForgeSkill> {
    // Read skill.yaml
    const yamlPath = path.join(skillPath, 'skill.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf-8');
    const metadata: SkillMetadata = yaml.parse(yamlContent);

    // Validate required fields
    if (!metadata.name || !metadata.version || !metadata.description) {
      throw new Error('Invalid skill.yaml: missing required fields (name, version, description)');
    }

    // Load tools dynamically
    // For now, return basic structure - tools will be loaded from src/tools/
    const skill: AgentForgeSkill = {
      metadata,
      tools: [], // TODO: Dynamically load tools from src/tools/
    };

    return skill;
  }

  /**
   * Validate Skill structure
   */
  static async validateSkill(skillPath: string): Promise<boolean> {
    try {
      // Check required files exist
      const requiredFiles = ['skill.yaml', 'README.md'];
      for (const file of requiredFiles) {
        const filePath = path.join(skillPath, file);
        await fs.access(filePath);
      }

      // Check required directories exist
      const requiredDirs = ['src', 'tests', 'examples'];
      for (const dir of requiredDirs) {
        const dirPath = path.join(skillPath, dir);
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          throw new Error(`${dir} is not a directory`);
        }
      }

      return true;
    } catch (error: any) {
      throw new Error(`Skill validation failed: ${error.message}`);
    }
  }
}
