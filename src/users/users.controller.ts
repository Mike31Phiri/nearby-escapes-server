import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import type { User } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  me(@CurrentUser() user: User) {
    return this.authService.sanitize(user);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Patch('me')
  update(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, dto, user.role);
  }
}
