import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { SharedMeetingNoteResponseDto } from '@src/meeting-notes/dto/responses/get-shared-meeting-note-by-id.response.dto';

import { MeetingNotesService } from '../meeting-notes/meeting-notes.service';

@ApiTags('Shared Notes')
@Controller('shared-notes')
@UseGuards(JwtUserGuard)
@ApiBearerAuth()
export class SharedMeetingNotesController {
  constructor(private readonly meetingNotesService: MeetingNotesService) {}

  @Get(':id')
  async getSharedNoteById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<SharedMeetingNoteResponseDto> {
    return this.meetingNotesService.getNoteForSharedUser(id, req.user);
  }
}
