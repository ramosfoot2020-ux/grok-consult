import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { PrivacyPoliciesService } from './privacy-policies.service';
import { PrivacyPoliciesController } from './privacy-policies.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PrivacyPoliciesController],
  providers: [PrivacyPoliciesService],
  exports: [PrivacyPoliciesService],
})
export class PrivacyPoliciesModule {}
