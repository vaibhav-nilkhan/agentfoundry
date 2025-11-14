import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('JWT')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    schema: {
      example: {
        id: 'cuid123',
        key: 'ak_live_abc123xyz...',
        name: 'Production API Key',
        tier: 'FREE',
        scopes: ['skills:execute', 'skills:read'],
        active: true,
        createdAt: '2025-01-14T10:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @CurrentUser() user: CurrentUserData
  ) {
    const apiKey = await this.apiKeyService.generateApiKey(
      user.id,
      createApiKeyDto.name,
      createApiKeyDto.scopes
    );

    return {
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      description: createApiKeyDto.description,
      tier: apiKey.tier,
      scopes: apiKey.scopes,
      active: apiKey.active,
      createdAt: apiKey.createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of API keys',
    schema: {
      example: [{
        id: 'cuid123',
        name: 'Production API Key',
        key: 'ak_live_***xyz',
        tier: 'FREE',
        active: true,
        lastUsedAt: '2025-01-14T09:00:00Z',
        usageCount: 150,
        createdAt: '2025-01-01T10:00:00Z'
      }]
    }
  })
  async findAll(@CurrentUser() user: CurrentUserData) {
    const apiKeys = await this.apiKeyService.listApiKeys(user.id);

    // Mask API keys for security
    return apiKeys.map(key => ({
      ...key,
      key: this.apiKeyService.maskApiKey(key.key),
    }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an API key' })
  @ApiResponse({ status: 200, description: 'API key updated successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async update(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.apiKeyService.updateApiKey(id, user.id, updateApiKeyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.apiKeyService.revokeApiKey(id, user.id);
  }
}
