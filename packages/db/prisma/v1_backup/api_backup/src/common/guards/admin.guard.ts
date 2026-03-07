import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Authentication required. Please provide valid credentials.',
      );
    }

    // Fetch full user with role from database
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is suspended or banned
    if (fullUser.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Account is ${fullUser.status.toLowerCase()}. Contact support for assistance.`,
      );
    }

    // Check if user has admin or moderator role
    if (fullUser.role !== 'ADMIN' && fullUser.role !== 'MODERATOR') {
      throw new ForbiddenException(
        'Access denied. Admin or moderator privileges required.',
      );
    }

    // Attach full user info to request
    request.user = fullUser;

    return true;
  }
}
