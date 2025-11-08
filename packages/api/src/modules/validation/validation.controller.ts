import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidationService } from './validation.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('validation')
@Controller('validation')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post('skill')
  @Public()
  @ApiOperation({ summary: 'Validate a Skill manifest and code' })
  @ApiResponse({ status: 200, description: 'Returns validation results' })
  async validateSkill(@Body() validationData: { manifest: any; code: string }) {
    return this.validationService.validateSkill(validationData);
  }
}
