import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all collections for current user' })
  findAll(@CurrentUser() user: User) {
    return this.collectionsService.findAll(user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a collection' })
  create(@CurrentUser() user: User, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a collection' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.update(id, user.id, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a collection' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.collectionsService.remove(id, user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a shared collection by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.collectionsService.findBySlug(slug);
  }
}
