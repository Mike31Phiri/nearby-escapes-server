import { Controller, Get, Req } from '@nestjs/common';
import { PlatformService } from './platform.service';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  /**
   * GET /api/platform/health
   *
   * Lightweight uptime-monitoring endpoint. Returns server status,
   * database connectivity, uptime, and environment info.
   * No auth required — designed for load balancers and monitors.
   */
  @Get('health')
  async health() {
    return this.platformService.checkHealth();
  }

  /**
   * GET /api/platform/bootstrap
   *
   * Returns all data needed to render every page in a single call.
   * - Public data always: stats, featured gems, popular locations, settings
   * - User data (when JWT is present): user profile, notifications, wishlist,
   *   host status, recent bookings
   *
   * The frontend calls this once on boot — no waterfall of API requests.
   */
  @Get('bootstrap')
  async bootstrap(@Req() req: any) {
    const publicData = await this.platformService.getBootstrap();

    // If the user sent a valid JWT, enrich with user-specific data
    if (req.user?.id) {
      const userData = await this.platformService.getUserBootstrap(req.user.id);
      return { ...publicData, ...userData };
    }

    return publicData;
  }
}
