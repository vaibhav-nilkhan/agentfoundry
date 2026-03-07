import { Module } from '@nestjs/common';
import { UsageTrackingController } from './usage-tracking.controller';
import { UsageTrackingService } from './usage-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeyModule } from '../api-keys/api-key.module';

@Module({
  imports: [PrismaModule, ApiKeyModule],
  controllers: [UsageTrackingController],
  providers: [UsageTrackingService],
  exports: [UsageTrackingService],
})
export class UsageTrackingModule {}
