import { Module } from '@nestjs/common';
import { UsageTrackingService } from './usage-tracking.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsageTrackingService],
  exports: [UsageTrackingService],
})
export class UsageTrackingModule {}
