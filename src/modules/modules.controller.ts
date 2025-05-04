import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Module } from './schemas/module.schema';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@ApiTags('modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Module successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async create(@Body() createModuleDto: CreateModuleDto): Promise<Module> {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all modules with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of modules',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Module>> {
    return this.modulesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Module found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Module not found',
  })
  async findOne(@Param('id') id: string): Promise<Module> {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Module updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Module not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<Module> {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module' })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Module deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Module not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.modulesService.remove(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get modules by course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Modules for the course',
  })
  async findByCourse(
    @Param('courseId') courseId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResult<Module>> {
    return this.modulesService.findByCourse(courseId, paginationDto);
  }
}
