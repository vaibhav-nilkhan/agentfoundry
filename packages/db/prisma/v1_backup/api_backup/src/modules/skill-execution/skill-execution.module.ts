import { Module } from '@nestjs/common';
import { SkillExecutionController } from './skill-execution.controller';
import { SkillExecutionService } from './skill-execution.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeyModule } from '../api-keys/api-key.module';
import { UsageTrackingModule } from '../usage-tracking/usage-tracking.module';

@Module({
  imports: [PrismaModule, ApiKeyModule, UsageTrackingModule],
  controllers: [SkillExecutionController],
  providers: [SkillExecutionService],
  exports: [SkillExecutionService],
})
export class SkillExecutionModule {}
