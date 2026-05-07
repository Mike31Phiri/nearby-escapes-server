import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StaysService } from './stays.service';

@ApiTags('Stays')
@Controller('stays')
export class StaysController {
  constructor(private staysService: StaysService) {}

  @Get()
  @ApiOperation({ summary: 'List stays with optional search/filter' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  findAll(
    @Query('q') q?: string,
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.staysService.findAll(
      q,
      location,
      minPrice ? +minPrice : undefined,
      maxPrice ? +maxPrice : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single stay by ID' })
  findOne(@Param('id') id: string) {
    return this.staysService.findOne(id);
  }
}
