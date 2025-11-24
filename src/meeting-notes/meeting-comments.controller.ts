import {
  Body,
  Query,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { JwtUserGuard } from '@src/auth/guards/jwt-user.guard';
import { RequestWithUser } from '@src/common/interfaces/request.interface';
import { apiDescriptions } from '@src/common/api-descriptions';
import { SuccessResponseDto } from '@src/auth/dto/responses/success.response.dto';

import { MeetingCommentsService } from './meeting-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetMeetingCommentResponseDto } from './dto/responses/get-meeting-comments.response.dto';
import { MeetingCommentResponseDto } from './dto/responses/posts-meeting-comments.response.dto';
import { GetMeetingCommentsQueryDto } from './dto/get-meeting-comments.query.dto';
@ApiTags('Meeting Comments')
@ApiBearerAuth()
@Controller('meeting-notes')
@UseGuards(JwtUserGuard)
export class MeetingCommentsController {
  constructor(private readonly meetingCommentsService: MeetingCommentsService) {}

  @Post(':noteId/comments')
  @ApiOperation({ summary: apiDescriptions.meetingComments.createMeetingComment.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.meetingComments.createMeetingComment.description,
    type: MeetingCommentResponseDto,
  })
  async createComment(
    @Param('noteId') noteId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ): Promise<MeetingCommentResponseDto> {
    return this.meetingCommentsService.createComment(noteId, dto, req.user);
  }

  @Get(':noteId/comments')
  @ApiOperation({ summary: apiDescriptions.meetingComments.getMeetingComments.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingComments.getMeetingComments.description,
    type: [GetMeetingCommentResponseDto],
  })
  async getComments(
    @Param('noteId') noteId: string,
    @Query() query: GetMeetingCommentsQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<GetMeetingCommentResponseDto[]> {
    return this.meetingCommentsService.getComments(noteId, req.user, query);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: apiDescriptions.meetingComments.updateMeetingComment.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.meetingComments.updateMeetingComment.description,
    type: MeetingCommentResponseDto,
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: RequestWithUser,
  ): Promise<MeetingCommentResponseDto> {
    return this.meetingCommentsService.updateComment(commentId, dto, req.user);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: apiDescriptions.meetingComments.deleteMeetingComment.summary })
  @ApiOkResponse({
    description: apiDescriptions.meetingComments.deleteMeetingComment.description,
    type: SuccessResponseDto,
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponseDto> {
    return this.meetingCommentsService.deleteComment(commentId, req.user);
  }

  @Post(':noteId/comments/:commentId/replies')
  @ApiOperation({ summary: apiDescriptions.meetingComments.replyMeetingComment.summary })
  @ApiCreatedResponse({
    description: apiDescriptions.meetingComments.replyMeetingComment.description,
    type: MeetingCommentResponseDto,
  })
  async createReply(
    @Param('noteId') noteId: string,
    @Param('commentId') parentId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ): Promise<MeetingCommentResponseDto> {
    return this.meetingCommentsService.createReply(noteId, parentId, dto, req.user);
  }
}
