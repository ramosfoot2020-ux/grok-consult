import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { apiDescriptions } from '@src/common/api-descriptions';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { SuccessResponseDto } from '@src/auth/dto/responses/success.response.dto';
import { UpdateMeetingNoteDto } from '@src/meeting-notes/dto/update-meeting-notes.dto';
import { GenerateAssetUploadUrlDto } from '@src/upload/dto/generate-asset-upload-url.dto';
import { GetAssetAccessUrlResponseDto } from '@src/meeting-notes/dto/responses/get-asset-access-url.response.dto';
import { GenerateAssetUploadUrlResponseDto } from '@src/meeting-notes/dto/responses/generate-asset-upload-url.response.dto';
import { TogglePublicSharingResponseDtoDto } from '@src/meeting-notes/dto/responses/toggle-public-sharing.response.dto';
import { TogglePublicSharingDto } from '@src/meeting-notes/dto/toggle-public-sharing.dto';
import { SegmentDto } from '@src/summarization/dto/transcription.dto';
import { GenerateSummaryDto } from '@src/meeting-notes/dto/responses/generate-summary.dto';
import { UploadTranscriptionDto } from '@src/meeting-notes/dto/responses/upload-transcription.dto';

import { CreateMeetingNoteDto } from './dto/create-meeting-note.dto';
import { UpdateRecurringMeetingDto } from './dto/update-recurring-meeting.dto';
import { DeleteRecurringMeetingDto } from './dto/delete-recurring-meeting.dto';
import { MeetingNotesService } from './meeting-notes.service';
import { GetAllMeetingNotesQueryDto } from './dto/get-all-meeting-notes.query.dto';
import { GetAllMeetingNotesResponseDto } from './dto/responses/get-all-meeting-notes.response.query.dto';
import { MeetingNoteResponseDto } from './dto/responses/get-meeting-note-bu-id.reponse.dto';

@ApiTags('Meeting Notes')
@Controller('meeting-notes')
@ApiBearerAuth()
export class MeetingNotesController {
  constructor(private readonly meetingNotesService: MeetingNotesService) {}

  @ApiOperation({ summary: apiDescriptions.meetingNotes.createMeetingNote.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.meetingNotes.createMeetingNote.description,
    type: MeetingNoteResponseDto,
  })
  @UseGuards(JwtUserGuard)
  @Post()
  async createMeetingNote(
    @Body() createMeetingNoteDto: CreateMeetingNoteDto,
    @Req() req: RequestWithUser,
  ): Promise<MeetingNoteResponseDto> {
    return this.meetingNotesService.createMeetingNote(createMeetingNoteDto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.getMeetingNoteById.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.getMeetingNoteById.description,
    type: MeetingNoteResponseDto,
  })
  @UseGuards(JwtUserGuard)
  @Get(':id')
  async getMeetingNoteById(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<MeetingNoteResponseDto> {
    return this.meetingNotesService.getMeetingNoteById(id, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.getAllMeetingNotes.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.getAllMeetingNotes.description,
    type: GetAllMeetingNotesResponseDto,
  })
  @UseGuards(JwtUserGuard)
  @Get()
  async getAllMeetingNotes(
    @Req() req: RequestWithUser,
    @Query() getAllMeetingNotesQueryDto: GetAllMeetingNotesQueryDto,
  ): Promise<GetAllMeetingNotesResponseDto> {
    return this.meetingNotesService.getAllMeetingNotes(req.user, getAllMeetingNotesQueryDto);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.updateMeetingNote.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.updateMeetingNote.summary,
    type: MeetingNoteResponseDto,
  })
  @UseGuards(JwtUserGuard)
  @Patch(':id')
  async updateMeetingNote(
    @Param('id') id: string,
    @Body() updateMeetingNoteDto: UpdateMeetingNoteDto,
    @Req() req: RequestWithUser,
  ): Promise<MeetingNoteResponseDto> {
    return this.meetingNotesService.updateMeetingNote(id, updateMeetingNoteDto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.updateRecurringMeetingChain.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.updateRecurringMeetingChain.description,
    type: SuccessResponseDto,
  })
  @Patch('recurring/:recurringId')
  @UseGuards(JwtUserGuard)
  async updateRecurringMeetingChain(
    @Param('recurringId') recurringId: string,
    @Body() dto: UpdateRecurringMeetingDto,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.meetingNotesService.updateRecurringMeetingChain(recurringId, dto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.deleteMeetingNote.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.deleteMeetingNote.description,
    type: SuccessResponseDto,
  })
  @Roles(RolesEnum.OWNER)
  @UseGuards(JwtUserGuard, RolesGuard)
  @Delete(':id')
  async deleteMeetingNote(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.meetingNotesService.deleteMeetingNote(id, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.deleteRecurringMeetingChain.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.deleteRecurringMeetingChain.description,
    type: SuccessResponseDto,
  })
  @Delete('recurring/:recurringId')
  @Roles(RolesEnum.OWNER)
  @UseGuards(JwtUserGuard, RolesGuard)
  async deleteRecurringMeetingChain(
    @Param('recurringId') recurringId: string,
    @Body() dto: DeleteRecurringMeetingDto,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.meetingNotesService.deleteRecurringMeetingChain(recurringId, dto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.generatePresignedUrl.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.meetingNotes.generatePresignedUrl.description,
    type: GenerateAssetUploadUrlResponseDto,
  })
  @Post(':id/assets/generate-upload-url')
  @UseGuards(JwtUserGuard)
  async generateAssetUploadUrl(
    @Param('id') id: string,
    @Body() dto: GenerateAssetUploadUrlDto,
    @Req() req: RequestWithUser,
  ): Promise<GenerateAssetUploadUrlResponseDto> {
    return this.meetingNotesService.generateAssetUploadUrl(id, dto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.getAssetAccessUrl.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.getAssetAccessUrl.description,
    type: GetAssetAccessUrlResponseDto,
  })
  @Get(':id/assets/:assetId/access-url')
  @UseGuards(JwtUserGuard)
  async getAssetAccessUrl(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @Req() req: RequestWithUser,
  ): Promise<GetAssetAccessUrlResponseDto> {
    return this.meetingNotesService.getAssetAccessUrl(id, assetId, req.user);
  }

  @Patch(':id/public-share')
  @UseGuards(JwtUserGuard)
  @ApiOperation({ summary: apiDescriptions.meetingNotes.togglePublicSharing.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.togglePublicSharing.description,
    type: TogglePublicSharingResponseDtoDto,
  })
  async togglePublicSharing(
    @Param('id') id: string,
    @Body() dto: TogglePublicSharingDto,
    @Req() req: RequestWithUser,
  ): Promise<TogglePublicSharingResponseDtoDto> {
    return this.meetingNotesService.togglePublicSharing(id, dto, req.user);
  }

  @ApiOperation({ summary: apiDescriptions.meetingNotes.generateSummaryFromAsset.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.generateSummaryFromAsset.description,
    type: MeetingNoteResponseDto,
  })
  @Post(':id/generate-summary')
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER, RolesEnum.USER)
  @UseGuards(JwtUserGuard)
  async generateSummaryFromAsset(
    @Param('id') id: string,
    @Body() dto: GenerateSummaryDto,
    @Req() req: RequestWithUser,
  ): Promise<MeetingNoteResponseDto> {
    return this.meetingNotesService.generateSummaryFromAsset(id, dto, req.user);
  }

  @ApiOperation({
    summary: apiDescriptions.meetingNotes.getStructuredTranscriptionByAssetId.summary,
  })
  @ApiOkResponse({
    description: apiDescriptions.meetingNotes.getStructuredTranscriptionByAssetId.description,
    type: [SegmentDto],
  })
  @Get('assets/:assetId/structured-transcription')
  @UseGuards(JwtUserGuard)
  async getStructuredTranscriptionByAssetId(
    @Param('assetId') assetId: string,
    @Req() req: RequestWithUser,
  ): Promise<SegmentDto[]> {
    return this.meetingNotesService.getStructuredTranscriptionByAssetId(assetId, req.user);
  }

  // Temporary method for testing transcription - summarization integration
  @ApiOperation({ summary: 'Upload a transcription file for a meeting asset' })
  @ApiOkResponse({
    description: "Saves the asset's structured transcription.",
    type: SuccessResponseDto,
  })
  @Post('assets/:assetId/upload-transcription')
  @UseGuards(JwtUserGuard)
  async uploadTranscription(
    @Param('assetId') assetId: string,
    @Body() dto: UploadTranscriptionDto,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.meetingNotesService.uploadTranscription(assetId, dto, req.user);
  }

  @ApiOperation({ summary: 'Streams the generated summary block by block.' })
  @ApiOkResponse({ description: 'Returns a stream of Tiptap JSON blocks.' })
  @Sse(':id/summary/stream')
  @Roles(RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER, RolesEnum.USER)
  @UseGuards(JwtUserGuard)
  streamSummary(
    @Param('id') id: string,
    @Query() dto: GenerateSummaryDto,
    @Req() req: RequestWithUser,
  ): Observable<MessageEvent> {
    return this.meetingNotesService.streamSummary(id, dto, req.user);
  }

  @Delete('assets/:assetId')
  @ApiOperation({ summary: 'Delete a meeting asset' })
  @ApiOkResponse({ description: 'Asset deleted successfully', type: SuccessResponseDto })
  @UseGuards(JwtUserGuard)
  async deleteAsset(
    @Param('assetId') assetId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.meetingNotesService.deleteAsset(assetId, req.user);
  }
}
