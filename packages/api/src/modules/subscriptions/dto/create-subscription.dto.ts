import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export class CreateSubscriptionDto {
  @ApiProperty({
    enum: SubscriptionTier,
    description: 'Subscription tier',
    example: SubscriptionTier.CREATOR,
  })
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @ApiProperty({
    description: 'Trial end date (optional)',
    example: '2025-02-14T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  trialEnd?: string;
}
