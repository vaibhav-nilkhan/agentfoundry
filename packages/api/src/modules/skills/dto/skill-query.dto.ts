import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SkillStatus } from '@agentfoundry/shared';

export enum SkillTier {
  PRODUCTION = 'production',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental',
}

export class SkillQueryDto {
  @ApiProperty({ required: false, example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false, example: 'Utilities', description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, example: 'weather', description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: SkillStatus,
    description: 'Filter by status (admin only)',
  })
  @IsOptional()
  @IsEnum(SkillStatus)
  status?: SkillStatus;

  @ApiProperty({
    required: false,
    enum: SkillTier,
    description: 'Filter by quality tier (production, beta, experimental)',
    example: 'production',
  })
  @IsOptional()
  @IsEnum(SkillTier)
  tier?: SkillTier;
}
