import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(ApiKeyGuard, AdminGuard)
@ApiBearerAuth('ApiKey')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== ANALYTICS ====================

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description: 'Get comprehensive overview stats (users, revenue, skills, usage)',
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/revenue')
  @ApiOperation({
    summary: 'Get revenue analytics',
    description: 'Get revenue trends over time',
  })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 30)' })
  async getRevenueAnalytics(@Query('days') days?: number) {
    return this.adminService.getRevenueAnalytics(days ? parseInt(days.toString()) : 30);
  }

  @Get('analytics/growth')
  @ApiOperation({
    summary: 'Get user growth analytics',
    description: 'Get user growth trends over time',
  })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 30)' })
  async getUserGrowthAnalytics(@Query('days') days?: number) {
    return this.adminService.getUserGrowthAnalytics(days ? parseInt(days.toString()) : 30);
  }

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get users with pagination, search, and filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'MODERATOR'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers({
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
      search,
      role,
      status,
    });
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Get user details',
    description: 'Get detailed information about a specific user',
  })
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Put('users/:id/status')
  @ApiOperation({
    summary: 'Update user status',
    description: 'Suspend, ban, or activate a user account',
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.updateUserStatus(id, status, reason);
  }

  @Put('users/:id/role')
  @ApiOperation({
    summary: 'Update user role',
    description: 'Change user role (USER, ADMIN, MODERATOR)',
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  @Get('subscriptions')
  @ApiOperation({
    summary: 'Get all subscriptions',
    description: 'Get subscriptions with pagination and filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'tier', required: false, enum: ['FREE', 'CREATOR', 'PRO', 'ENTERPRISE'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING'] })
  async getSubscriptions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tier') tier?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSubscriptions({
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
      tier,
      status,
    });
  }

  @Post('subscriptions/:id/cancel')
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Admin cancellation of a subscription',
  })
  async cancelSubscription(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.cancelSubscription(id, reason);
  }

  // ==================== SKILL MANAGEMENT ====================

  @Get('skills')
  @ApiOperation({
    summary: 'Get all skills',
    description: 'Get skills with pagination and filters for moderation',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'DEPRECATED'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getSkills(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getSkills({
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
      status,
      search,
    });
  }

  @Put('skills/:id/status')
  @ApiOperation({
    summary: 'Update skill status',
    description: 'Approve, reject, or deprecate a skill',
  })
  async updateSkillStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateSkillStatus(id, status);
  }
}
