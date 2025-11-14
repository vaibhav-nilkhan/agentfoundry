import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(ApiKeyGuard)
@ApiBearerAuth('ApiKey')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new subscription',
    description: 'Subscribe to a tier (FREE, CREATOR, PRO, ENTERPRISE)',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    schema: {
      example: {
        id: 'clr123...',
        userId: 'clr456...',
        tier: 'CREATOR',
        status: 'ACTIVE',
        monthlyLimit: null,
        usageCount: 0,
        resetDate: '2025-02-14T00:00:00Z',
        features: [
          'All premium skills',
          'Unlimited executions',
          'Priority support',
          'API access',
        ],
        price: 39,
        createdAt: '2025-01-14T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User already has a subscription',
  })
  async createSubscription(
    @Request() req: any,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.createSubscription(
      userId,
      createSubscriptionDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get current subscription',
    description: 'Retrieve subscription details for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription details retrieved successfully',
    schema: {
      example: {
        id: 'clr123...',
        userId: 'clr456...',
        tier: 'CREATOR',
        status: 'ACTIVE',
        monthlyLimit: null,
        usageCount: 245,
        remaining: null,
        percentageUsed: 0,
        resetDate: '2025-02-14T00:00:00Z',
        features: [
          'All premium skills',
          'Unlimited executions',
          'Priority support',
          'API access',
        ],
        price: 39,
        currentPeriodStart: '2025-01-14T00:00:00Z',
        currentPeriodEnd: '2025-02-14T00:00:00Z',
        cancelAtPeriodEnd: false,
        user: {
          id: 'clr456...',
          email: 'user@example.com',
          displayName: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscription(@Request() req: any) {
    const userId = req.user.id;
    return this.subscriptionService.getSubscription(userId);
  }

  @Put()
  @ApiOperation({
    summary: 'Update subscription',
    description:
      'Upgrade, downgrade, or cancel subscription. Upgrades apply immediately, downgrades at period end.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    schema: {
      example: {
        id: 'clr123...',
        tier: 'PRO',
        status: 'ACTIVE',
        features: [
          'Everything in Creator',
          'White-label option',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantee',
        ],
        price: 99,
        message: 'Subscription upgraded successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(
    @Request() req: any,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.updateSubscription(
      userId,
      updateSubscriptionDto,
    );
  }

  @Delete()
  @ApiOperation({
    summary: 'Cancel subscription',
    description:
      'Cancel subscription immediately and downgrade to FREE tier. This action is immediate.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
    schema: {
      example: {
        id: 'clr123...',
        tier: 'FREE',
        status: 'CANCELED',
        message:
          'Subscription canceled successfully. Downgraded to FREE tier.',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancelSubscription(@Request() req: any) {
    const userId = req.user.id;
    return this.subscriptionService.cancelSubscription(userId);
  }

  @Get('tiers')
  @ApiOperation({
    summary: 'Get available subscription tiers',
    description:
      'List all available subscription tiers with features and pricing',
  })
  @ApiResponse({
    status: 200,
    description: 'Available tiers retrieved successfully',
    schema: {
      example: [
        {
          tier: 'FREE',
          monthlyLimit: 100,
          features: ['Basic skills', 'Community support'],
          price: 0,
        },
        {
          tier: 'CREATOR',
          monthlyLimit: null,
          features: [
            'All premium skills',
            'Unlimited executions',
            'Priority support',
            'API access',
          ],
          price: 39,
        },
        {
          tier: 'PRO',
          monthlyLimit: null,
          features: [
            'Everything in Creator',
            'White-label option',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantee',
          ],
          price: 99,
        },
        {
          tier: 'ENTERPRISE',
          monthlyLimit: null,
          features: [
            'Everything in Pro',
            'Custom deployment',
            'On-premise option',
            'Custom contract',
            'Dedicated account manager',
          ],
          price: 499,
        },
      ],
    },
  })
  async getAvailableTiers() {
    return this.subscriptionService.getAvailableTiers();
  }

  @Get('usage-limit')
  @ApiOperation({
    summary: 'Check usage limit status',
    description:
      'Check if user is within usage limits and get remaining quota',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage limit status retrieved successfully',
    schema: {
      example: {
        withinLimit: true,
        remaining: null,
        percentageUsed: 0,
        limit: null,
      },
    },
  })
  async checkUsageLimit(@Request() req: any) {
    const userId = req.user.id;
    return this.subscriptionService.checkUsageLimit(userId);
  }
}
