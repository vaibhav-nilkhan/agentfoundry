import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Platform, PricingType } from '@agentfoundry/shared';

export class CreateSkillDto {
  @ApiProperty({ example: 'Weather Forecast', description: 'Skill name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'Get accurate weather forecasts for any location',
    description: 'Short description',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  description: string;

  @ApiProperty({
    example: 'This skill provides real-time weather information...',
    description: 'Long description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  longDescription?: string;

  @ApiProperty({ example: 'Utilities', description: 'Skill category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: ['weather', 'forecast', 'api'],
    description: 'Tags for discovery',
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ example: '1.0.0', description: 'Version (semver)' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({
    enum: Platform,
    isArray: true,
    example: [Platform.MCP, Platform.CLAUDE_SKILLS],
    description: 'Supported platforms',
  })
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms: Platform[];

  @ApiProperty({
    example: ['network.http', 'location.read'],
    description: 'Required permissions',
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({
    example: 'https://example.com/manifest.json',
    description: 'Manifest URL',
  })
  @IsString()
  @IsNotEmpty()
  manifestUrl: string;

  @ApiProperty({
    example: 'https://github.com/user/skill',
    description: 'Code repository URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  codeUrl?: string;

  @ApiProperty({
    example: 'https://docs.example.com',
    description: 'Documentation URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  documentationUrl?: string;

  @ApiProperty({
    enum: PricingType,
    example: PricingType.FREE,
    description: 'Pricing model',
  })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiProperty({
    example: 0,
    description: 'Price (if PAID or FREEMIUM)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: [],
    description: 'Dependency skill IDs',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];
}
