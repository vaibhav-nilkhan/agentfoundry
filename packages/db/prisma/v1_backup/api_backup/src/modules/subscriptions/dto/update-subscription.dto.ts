import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionTier } from './create-subscription.dto';

export class UpdateSubscriptionDto {
  @ApiProperty({
    enum: SubscriptionTier,
    description: 'New subscription tier (for upgrades/downgrades)',
    example: SubscriptionTier.PRO,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionTier)
  tier?: SubscriptionTier;

  @ApiProperty({
    description: 'Cancel subscription at end of current period',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;
}
