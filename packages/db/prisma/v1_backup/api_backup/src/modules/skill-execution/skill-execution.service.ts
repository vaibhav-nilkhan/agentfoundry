import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyService } from '../api-keys/api-key.service';
import { UsageTrackingService } from '../usage-tracking/usage-tracking.service';
import * as path from 'path';

@Injectable()
export class SkillExecutionService {
  constructor(
    private prisma: PrismaService,
    private apiKeyService: ApiKeyService,
    private usageTracking: UsageTrackingService
  ) {}

  /**
   * Execute a skill tool on our servers (PROTECTED)
   * This is the core protection mechanism - skill code NEVER leaves our servers
   */
  async execute(
    skillId: string,
    toolName: string,
    input: any,
    userId: string,
    subscription: any,
    apiKeyId: string
  ) {
    // 1. Check if user has access to this skill
    const accessCheck = await this.apiKeyService.checkSkillAccess(userId, skillId, toolName);

    if (!accessCheck.hasAccess) {
      throw new ForbiddenException(accessCheck.reason);
    }

    // 2. Load skill metadata
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // 3. Execute skill on OUR servers
    const startTime = Date.now();
    let result: any;
    let success = true;
    let errorMessage: string | null = null;

    try {
      // Load and execute the skill code
      result = await this.loadAndExecuteSkill(skill.slug, toolName, input);
    } catch (error: any) {
      success = false;
      errorMessage = error.message;
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;

      // 4. Track usage for billing and analytics
      await this.usageTracking.trackExecution({
        userId,
        skillId,
        toolName,
        platform: 'MCP', // TODO: Detect from request
        success,
        executionTime,
        errorMessage,
        apiKeyId,
      });
    }

    return result;
  }

  /**
   * Load skill code from OUR file system and execute it
   * The actual skill implementation NEVER goes to the user
   */
  private async loadAndExecuteSkill(skillSlug: string, toolName: string, input: any) {
    // Path to skill on OUR servers
    const skillPath = path.join(
      process.cwd(),
      'skills',
      'production',
      skillSlug,
      'src',
      'tools',
      `${toolName}.ts`
    );

    try {
      // Dynamically import the skill module
      // This code runs on OUR infrastructure, not user's machine
      const skillModule = await import(skillPath);

      if (typeof skillModule.run !== 'function') {
        throw new Error(`Skill tool ${toolName} does not export a 'run' function`);
      }

      // Execute the skill function with user's input
      // All proprietary logic runs here on our servers
      const result = await skillModule.run(input);

      return result;
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error(`Skill tool not found: ${skillSlug}/${toolName}`);
      }
      throw error;
    }
  }

  /**
   * For development/testing: Load skill from compiled JavaScript
   */
  private async loadCompiledSkill(skillSlug: string, toolName: string, input: any) {
    // In production, skills would be pre-compiled to JavaScript
    const compiledPath = path.join(
      process.cwd(),
      'dist',
      'skills',
      skillSlug,
      'tools',
      `${toolName}.js`
    );

    const skillModule = await import(compiledPath);
    return await skillModule.run(input);
  }

  /**
   * Get list of available tools for a skill
   */
  async getSkillTools(skillId: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Parse skill.yaml to get tool list
    // For now, return mock data
    return {
      skillId,
      skillName: skill.name,
      tools: [
        // TODO: Parse from skill.yaml
      ],
    };
  }
}
