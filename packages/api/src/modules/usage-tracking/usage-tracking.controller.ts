import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { UsageTrackingService } from './usage-tracking.service';

@ApiTags('usage')
@Controller('usage')
@UseGuards(ApiKeyGuard)
@ApiBearerAuth('ApiKey')
export class UsageTrackingController {
  constructor(private usageTrackingService: UsageTrackingService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current month usage statistics',
    description:
      'Returns detailed usage statistics for the current billing period, ' +
      'including total executions, success rate, remaining quota, and breakdown by skill.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage statistics retrieved successfully',
    schema: {
      example: {
        period: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-31T23:59:59Z'
        },
        usage: {
          total: 245,
          success: 238,
          failures: 7
        },
        limit: 1000,
        remaining: 755,
        percentageUsed: 24.5,
        resetDate: '2025-02-01T00:00:00Z',
        breakdown: [
          {
            skillName: 'Viral Content Predictor',
            skillSlug: 'viral-content-predictor',
            totalExecutions: 150,
            avgExecutionTime: 234
          },
          {
            skillName: 'Technical Debt Quantifier',
            skillSlug: 'technical-debt-quantifier',
            totalExecutions: 95,
            avgExecutionTime: 1250
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async getCurrentMonthUsage(@Request() req: any) {
    const userId = req.user.id;

    // Get monthly usage stats
    const monthlyUsage = await this.usageTrackingService.getMonthlyUsage(userId);

    // Get usage breakdown by skill
    const breakdown = await this.usageTrackingService.getUsageBySkill(userId);

    // Check usage limit status
    const limitStatus = await this.usageTrackingService.checkUsageLimit(userId);

    return {
      ...monthlyUsage,
      percentageUsed: limitStatus.percentageUsed,
      breakdown,
    };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get usage history for a specific date range',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'ISO date string' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'ISO date string' })
  @ApiResponse({
    status: 200,
    description: 'Historical usage data',
  })
  async getUsageHistory(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.id;

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const usage = await this.usageTrackingService.getMonthlyUsage(userId, start, end);
    const breakdown = await this.usageTrackingService.getUsageBySkill(userId, start, end);

    return {
      ...usage,
      breakdown,
    };
  }

  @Get('limit-status')
  @ApiOperation({
    summary: 'Check if user is approaching usage limit',
    description: 'Returns warning if user has used >80% of monthly quota',
  })
  @ApiResponse({
    status: 200,
    description: 'Limit status',
    schema: {
      example: {
        withinLimit: true,
        percentageUsed: 85,
        remaining: 150,
        warning: 'You have used 85% of your monthly quota. Consider upgrading to avoid interruptions.'
      }
    }
  })
  async checkLimitStatus(@Request() req: any) {
    const userId = req.user.id;
    const limitStatus = await this.usageTrackingService.checkUsageLimit(userId);

    let warning: string | null = null;

    if (limitStatus.percentageUsed >= 90) {
      warning = 'You have used over 90% of your monthly quota. Upgrade now to avoid service interruption.';
    } else if (limitStatus.percentageUsed >= 80) {
      warning = 'You have used 80% of your monthly quota. Consider upgrading to avoid interruptions.';
    }

    return {
      ...limitStatus,
      warning,
    };
  }
}
