import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecurityLevelGuard } from '../auth/guards/security-level.guard';
import { SecurityLevel } from '../auth/decorators/security-level.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@ApiTags('Disputes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SecurityLevelGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  /**
   * POST /disputes
   * Authenticated user (guest or host) files a dispute on a recent booking.
   * Security: INTERNAL — any authenticated user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SecurityLevel('INTERNAL')
  @ApiOperation({
    summary: 'File a dispute on a recent booking',
    description:
      'Tag one of your recent (completed/cancelled) bookings and write a complaint message. ' +
      'Once submitted, the dispute is read-only for users — only admins can update the status.',
  })
  @ApiResponse({ status: 201, description: 'Dispute filed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid booking or duplicate dispute' })
  @ApiResponse({ status: 403, description: 'Booking does not belong to caller' })
  create(@CurrentUser() user: User, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(user.id, user.role, dto);
  }

  /**
   * GET /disputes/my
   * Returns the calling user's own disputes (read-only).
   * Security: INTERNAL — any authenticated user.
   */
  @Get('my')
  @SecurityLevel('INTERNAL')
  @ApiOperation({
    summary: "List caller's own disputes (read-only)",
    description:
      'Returns disputes you have filed. Status updates are visible once resolved, ' +
      'but you cannot modify the dispute after creation.',
  })
  @ApiResponse({ status: 200, description: 'List of your disputes' })
  findMine(@CurrentUser() user: User) {
    return this.disputesService.findMine(user.id);
  }
}
