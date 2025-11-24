import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';
import { UserCompaniesModule } from '@src/user-companies/user-companies.module';
import { UploadsModule } from '@src/upload/upload.module';

import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [UploadsModule, PrismaModule, UserCompaniesModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
