import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';
import { UsersModule } from '@src/users/users.module';
import { UserCompaniesModule } from '@src/user-companies/user-companies.module';
import { UploadsModule } from '@src/upload/upload.module';
import { SharedMeetingNotesController } from '@src/meeting-notes/shared-meeting-notes.controller';
import { PublicMeetingNotesController } from '@src/meeting-notes/public-meeting-notes.controller';
import { MeetingCommentsController } from '@src/meeting-notes/meeting-comments.controller';
import { SummarizationModule } from '@src/summarization/summarization.module';

import { MeetingCommentsService } from './meeting-comments.service';
import { MeetingNotesService } from './meeting-notes.service';
import { MeetingNotesController } from './meeting-notes.controller';

@Module({
  imports: [PrismaModule, UsersModule, UserCompaniesModule, UploadsModule, SummarizationModule],
  controllers: [
    MeetingNotesController,
    SharedMeetingNotesController,
    PublicMeetingNotesController,
    MeetingCommentsController,
  ],
  providers: [MeetingNotesService, MeetingCommentsService],
  exports: [MeetingNotesService, MeetingCommentsService],
})
export class MeetingNotesModule {}
