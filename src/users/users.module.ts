import { Module } from '@nestjs/common';

import { LoggerModule } from 'nestjs-pino';

import { PrismaModule } from '@src/prisma/prisma.module';
import { UploadsModule } from '@src/upload/upload.module';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UploadsModule, PrismaModule, LoggerModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
