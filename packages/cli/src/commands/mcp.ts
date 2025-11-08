/**
 * MCP Command
 * Run an AgentFoundry Skill as an MCP server
 */

import { Command } from 'commander';
import * as path from 'path';
import { SkillLoader, MCPServerGenerator } from '@agentfoundry/mcp-adapter';

export const mcpCommand = new Command('mcp')
  .description('Run skill as MCP server')
  .argument('<skill-path>', 'Path to skill directory')
  .option('-v, --verbose', 'Verbose logging', false)
  .action(async (skillPath: string, options: { verbose: boolean }) => {
    try {
      const absolutePath = path.resolve(process.cwd(), skillPath);

      if (options.verbose) {
        console.error(`Loading skill from: ${absolutePath}`);
      }

      // Validate skill structure
      console.error('Validating skill structure...');
      await SkillLoader.validateSkill(absolutePath);

      // Load skill
      console.error('Loading skill...');
      const skill = await SkillLoader.loadSkill(absolutePath);

      // Start MCP server
      console.error(`Starting MCP server for: ${skill.metadata.name} v${skill.metadata.version}`);
      console.error('Ready to accept MCP requests via stdio');
      console.error('---');

      await MCPServerGenerator.start(skill);
    } catch (error: any) {
      console.error(`Error starting MCP server: ${error.message}`);
      if (options.verbose && error.stack) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });
