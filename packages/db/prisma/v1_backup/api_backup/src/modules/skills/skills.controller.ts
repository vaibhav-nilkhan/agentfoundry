import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { SkillRegistryService } from './skill-registry.service';
import { SkillExecutorService } from './skill-executor.service';
import { CreateSkillDto, UpdateSkillDto, SkillQueryDto, ExecuteSkillDto, BatchExecuteSkillDto } from './dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('skills')
@Controller('skills')
@UseGuards(SupabaseAuthGuard)
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly registryService: SkillRegistryService,
    private readonly executorService: SkillExecutorService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({ status: 200, description: 'Returns list of skills' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tier', required: false, enum: ['production', 'beta', 'experimental'], description: 'Filter by quality tier' })
  async findAll(@Query() query: SkillQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get skill by ID' })
  @ApiResponse({ status: 200, description: 'Returns skill details' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.skillsService.create(createSkillDto, user.id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a skill' })
  @ApiResponse({ status: 200, description: 'Skill updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.skillsService.update(id, updateSkillDto, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.skillsService.remove(id, user.id);
  }

  // ========== SKILL EXECUTION ENDPOINTS ==========

  @Post(':slug/execute/:toolName')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Execute a skill tool',
    description: 'Execute a specific tool within a skill with the provided input. The tool will run with a configurable timeout and return structured results.'
  })
  @ApiResponse({ status: 200, description: 'Tool executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error' })
  @ApiResponse({ status: 404, description: 'Skill or tool not found' })
  @ApiResponse({ status: 408, description: 'Execution timeout' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async executeSkill(
    @Param('slug') slug: string,
    @Param('toolName') toolName: string,
    @Body() executeDto: ExecuteSkillDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.executorService.execute(
      slug,
      toolName,
      executeDto.input,
      {
        timeout: executeDto.timeout,
        userId: user?.id,
        trackUsage: true,
      }
    );
  }

  @Post('execute/batch')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Execute multiple skill tools in sequence',
    description: 'Execute multiple tools sequentially, optionally stopping on first failure.'
  })
  @ApiResponse({ status: 200, description: 'Batch execution completed' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async executeBatch(
    @Body() batchDto: BatchExecuteSkillDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.executorService.executeBatch(
      batchDto.executions,
      {
        timeout: batchDto.timeout,
        userId: user?.id,
        trackUsage: true,
      }
    );
  }

  @Get(':slug/info')
  @Public()
  @ApiOperation({
    summary: 'Get skill information from registry',
    description: 'Get detailed information about a skill including all its tools and schemas.'
  })
  @ApiResponse({ status: 200, description: 'Returns skill info' })
  @ApiResponse({ status: 404, description: 'Skill not found in registry' })
  async getSkillInfo(@Param('slug') slug: string) {
    return this.registryService.getSkillInfo(slug);
  }

  @Get(':slug/stats')
  @Public()
  @ApiOperation({
    summary: 'Get skill execution statistics',
    description: 'Get execution metrics including success rate, average execution time, and recent executions.'
  })
  @ApiResponse({ status: 200, description: 'Returns skill statistics' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async getSkillStats(@Param('slug') slug: string) {
    return this.executorService.getSkillStats(slug);
  }

  @Get('registry/list')
  @Public()
  @ApiOperation({
    summary: 'List all registered skills',
    description: 'Get a list of all skills loaded in the registry.'
  })
  @ApiResponse({ status: 200, description: 'Returns list of registered skills' })
  async listRegisteredSkills() {
    return this.registryService.listSkills();
  }

  @Post('registry/reload')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Reload skill registry',
    description: 'Reload all skills from disk (admin only, requires authentication).'
  })
  @ApiResponse({ status: 200, description: 'Registry reloaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reloadRegistry() {
    await this.registryService.reload();
    return {
      message: 'Registry reloaded successfully',
      skills: this.registryService.listSkills()
    };
  }
}
