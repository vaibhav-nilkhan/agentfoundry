import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user from database or create if doesn't exist
   * This is called on every authenticated request
   */
  async getOrCreateUser(userData: CurrentUserData) {
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: userData.id },
    });

    if (!user) {
      // Auto-create user on first login
      user = await this.prisma.user.create({
        data: {
          firebaseUid: userData.id,
          email: userData.email!,
          displayName: userData.metadata?.full_name || userData.email?.split('@')[0],
          avatarUrl: userData.metadata?.avatar_url,
        },
      });
    }

    return user;
  }

  /**
   * Manually sync user profile from Supabase
   */
  async syncUser(userData: CurrentUserData) {
    const user = await this.prisma.user.upsert({
      where: { firebaseUid: userData.id },
      update: {
        email: userData.email!,
        displayName: userData.metadata?.full_name || userData.email?.split('@')[0],
        avatarUrl: userData.metadata?.avatar_url,
      },
      create: {
        firebaseUid: userData.id,
        email: userData.email!,
        displayName: userData.metadata?.full_name || userData.email?.split('@')[0],
        avatarUrl: userData.metadata?.avatar_url,
      },
    });

    return {
      message: 'User synced successfully',
      user,
    };
  }
}
