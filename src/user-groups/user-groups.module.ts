import { Module } from '@nestjs/common';

import { UserCompaniesModule } from '@src/user-companies/user-companies.module';

import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';

@Module({
  imports: [UserCompaniesModule],
  controllers: [UserGroupsController],
  providers: [UserGroupsService],
})
export class UserGroupsModule {}
