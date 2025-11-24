import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';
import { UsersModule } from '@src/users/users.module';
import { UserCompaniesModule } from '@src/user-companies/user-companies.module';

import { UsersManagementService } from './users-management.service';
import { UsersManagementController } from './users-management.controller';

@Module({
  imports: [PrismaModule, UsersModule, UserCompaniesModule],
  controllers: [UsersManagementController],
  providers: [UsersManagementService],
  exports: [UsersManagementService],
})
export class UsersManagementModule {}
