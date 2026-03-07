import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { SkillExecutionService } from './skill-execution.service';

@ApiTags('skill-execution')
@Controller('skills/execute')
@UseGuards(ApiKeyGuard)
@ApiSecurity('ApiKey')
export class SkillExecutionController {
  constructor(private skillExecutionService: SkillExecutionService) {}

  @Post(':skillId/:toolName')
  @ApiOperation({
    summary: 'Execute a skill tool (server-side execution for premium skills)',
    description:
      'Execute a skill tool on AgentFoundry servers. ' +
      'Premium skills run entirely on our infrastructure - your code never leaves our servers. ' +
      'This protects your intellectual property while providing seamless execution.',
  })
  @ApiResponse({
    status: 200,
    description: 'Skill executed successfully',
    schema: {
      example: {
        overall_score: 67,
        rating: 'good',
        breakdown: {
          hook_strength: 85,
          structure: 62,
          emotional_resonance: 58,
          trend_alignment: 45,
          visual_appeal: 70,
          call_to_action: 45
        },
        predicted_metrics: {
          impressions: 8700,
          likes: 620,
          shares: 89,
          comments: 45
        },
        improvements: [
          {
            issue: 'Weak call-to-action',
            impact: 'high',
            recommendation: 'End with polarizing question',
            expected_score_increase: 10
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Premium subscription required or usage limit exceeded',
    schema: {
      example: {
        statusCode: 403,
        message: 'Premium skill requires subscription. Upgrade at https://agentfoundry.ai/pricing'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Skill or tool not found'
  })
  async executeSkill(
    @Param('skillId') skillId: string,
    @Param('toolName') toolName: string,
    @Body() input: any,
    @Request() req: any
  ) {
    // Extract user info attached by ApiKeyGuard
    const userId = req.user.id;
    const subscription = req.subscription;
    const apiKeyId = req.apiKeyId;

    // Execute skill on OUR servers
    // User's code/logic stays completely hidden
    return this.skillExecutionService.execute(
      skillId,
      toolName,
      input,
      userId,
      subscription,
      apiKeyId
    );
  }
}
