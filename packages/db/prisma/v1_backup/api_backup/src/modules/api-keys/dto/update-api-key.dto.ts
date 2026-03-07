import { IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyDto {
  @ApiProperty({
    description: 'Name for the API key',
    example: 'Updated Production Key',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Scopes/permissions for this API key',
    example: ['skills:execute', 'skills:read', 'skills:write'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  scopes?: string[];
}
