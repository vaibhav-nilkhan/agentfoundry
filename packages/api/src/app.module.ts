import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
