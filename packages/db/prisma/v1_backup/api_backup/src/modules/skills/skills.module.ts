import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { SkillRegistryService } from './skill-registry.service';
import { SkillExecutorService } from './skill-executor.service';

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, SkillRegistryService, SkillExecutorService],
  exports: [SkillsService, SkillRegistryService, SkillExecutorService],
})
export class SkillsModule {}
