import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { MeetingNotesService } from '../meeting-notes/meeting-notes.service';

@ApiTags('Public Notes')
@Controller('public-notes')
export class PublicMeetingNotesController {
  constructor(private readonly meetingNotesService: MeetingNotesService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Get a meeting note via its public slug' })
  @ApiOkResponse({ description: 'The public data for the meeting note.' })
  async getPublicNoteBySlug(@Param('slug') slug: string) {
    return this.meetingNotesService.getNoteByPublicSlug(slug);
  }
}
