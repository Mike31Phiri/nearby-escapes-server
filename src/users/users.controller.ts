import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { User } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Current user profile' })
  profile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Any user profile (public)' })
  findOne(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update own profile' })
  update(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    const url = (file as any).location ?? `/uploads/${(file as any).filename}`;
    return this.usersService.updateProfile(user.id, { avatar: url });
  }
}
