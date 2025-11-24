import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';
import { UsersModule } from '@src/users/users.module';
import { UserCompaniesModule } from '@src/user-companies/user-companies.module';
import { SchedulerModule } from '@src/scheduler/scheduler.module';
import { CompaniesModule } from '@src/companies/companies.module';

import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { InvitesQueueProcessor } from './invites-queue.proessor';

@Module({
  imports: [PrismaModule, UsersModule, UserCompaniesModule, SchedulerModule, CompaniesModule],
  controllers: [InvitesController],
  providers: [InvitesService, InvitesQueueProcessor],
  exports: [InvitesService],
})
export class InvitesModule {}
