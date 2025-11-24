import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { UserPrivacyAgreementsService } from './user-privacy-agreements.service';
import { UserPrivacyAgreementsController } from './user-privacy-agreements.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserPrivacyAgreementsController],
  providers: [UserPrivacyAgreementsService],
  exports: [UserPrivacyAgreementsService],
})
export class UserPrivacyAgreementsModule {}
