import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './config/prisma.module';
import { SupabaseModule } from './config/supabase.module';
import { SkillsModule } from './modules/skills/skills.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ValidationModule } from './modules/validation/validation.module';
// NEW: Hybrid Protection System modules
import { ApiKeyModule } from './modules/api-keys/api-key.module';
import { UsageTrackingModule } from './modules/usage-tracking/usage-tracking.module';
import { SkillExecutionModule } from './modules/skill-execution/skill-execution.module';
import { SubscriptionModule } from './modules/subscriptions/subscription.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { AdminModule } from './modules/admin/admin.module';
import { RedisThrottlerStorage } from './common/throttler/redis-throttler.storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate Limiting with Redis Storage
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000, // 60 seconds
          limit: 60, // 60 requests per minute (default for unauthenticated)
        },
      ],
      storage: new RedisThrottlerStorage(
        process.env.REDIS_URL || 'redis://localhost:6379'
      ),
    }),
    PrismaModule,
    SupabaseModule,
    SkillsModule,
    AuthModule,
    UsersModule,
    ValidationModule,
    // NEW: Hybrid Protection System
    ApiKeyModule,
    UsageTrackingModule,
    SkillExecutionModule,
    SubscriptionModule,
    StripeModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply throttling globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
