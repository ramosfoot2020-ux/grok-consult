import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';
import { UsersModule } from '@src/users/users.module';

import { UserCompaniesService } from './user-companies.service';
import { UserCompaniesController } from './user-companies.controller';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [UserCompaniesController],
  providers: [UserCompaniesService],
  exports: [UserCompaniesService],
})
export class UserCompaniesModule {}
