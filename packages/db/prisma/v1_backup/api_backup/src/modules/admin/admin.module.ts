import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../../config/prisma.module';
import { ApiKeyModule } from '../api-keys/api-key.module';

@Module({
  imports: [PrismaModule, ApiKeyModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
