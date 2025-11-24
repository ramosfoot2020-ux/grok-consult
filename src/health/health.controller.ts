import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { PrismaService } from '@src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private diskHealthIndicator: DiskHealthIndicator,
    private prismaHealthIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get('db-status')
  @ApiExcludeEndpoint()
  @HealthCheck()
  dbStatus() {
    return this.healthCheckService.check([
      () => this.prismaHealthIndicator.pingCheck('prisma', this.prisma, { timeout: 300 }),
    ]);
  }

  @Get('api-storage-status')
  @ApiExcludeEndpoint()
  @HealthCheck()
  apiStatus() {
    return this.healthCheckService.check([
      () =>
        this.diskHealthIndicator.checkStorage('storage', {
          path: this.configService.getOrThrow('health.disk.path'),
          threshold: this.configService.getOrThrow('health.disk.size') * 1024 * 1024 * 1024,
        }),
    ]);
  }
}
