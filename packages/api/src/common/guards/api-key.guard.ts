import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../../modules/api-keys/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Extract API key from header
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException(
        'API key required. Get your API key at https://agentfoundry.ai/api-keys'
      );
    }

    try {
      // Validate and attach user info to request
      const keyData = await this.apiKeyService.validateApiKey(apiKey);

      request.user = keyData.user;
      request.subscription = keyData.subscription;
      request.tier = keyData.tier;
      request.scopes = keyData.scopes;
      request.apiKeyId = keyData.apiKeyId;

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private extractApiKey(request: any): string | null {
    // Check Authorization header: Bearer ak_live_xxx or Bearer ak_test_xxx
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ak_')) {
      return authHeader.substring(7); // Remove "Bearer "
    }

    // Check x-api-key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader?.startsWith('ak_')) {
      return apiKeyHeader;
    }

    return null;
  }
}
