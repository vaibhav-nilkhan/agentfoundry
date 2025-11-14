import { IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Name for the API key',
    example: 'Production API Key',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Optional description',
    example: 'Used for production skill execution',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Scopes/permissions for this API key',
    example: ['skills:execute', 'skills:read'],
    default: ['skills:execute', 'skills:read'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  scopes?: string[];
}
