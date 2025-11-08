import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: CurrentUserData) {
    return this.authService.getOrCreateUser(user);
  }

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Sync user profile from Supabase to PostgreSQL' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  async syncUser(@CurrentUser() user: CurrentUserData) {
    return this.authService.syncUser(user);
  }
}
