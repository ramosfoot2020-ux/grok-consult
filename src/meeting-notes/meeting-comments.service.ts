import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';

import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  selectMeetingCommentsPopulate,
  authorMeetingCommentsPopulate,
} from '@src/meeting-notes/populate/meeting-comments-populate';
import { getMeetingNoteByIdPopulate } from '@src/meeting-notes/populate/get-meeting-note-bu-id-populate';
import { errorMessages } from '@src/common/error-messages';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetMeetingCommentResponseDto } from './dto/responses/get-meeting-comments.response.dto';
import { GetMeetingCommentsQueryDto } from './dto/get-meeting-comments.query.dto';
@Injectable()
export class MeetingCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(noteId: string, dto: CreateCommentDto, user: UserPayloadInterface) {
    await this.checkGetCreateAccess(noteId, user);

    return this.prisma.meetingComment.create({
      data: {
        content: dto.content,
        from: dto.from,
        to: dto.to,
        editorDataCommentId: dto.editorDataCommentId,
        type: dto.type,
        meetingNoteId: noteId,
        authorId: user.userId,
      },
      include: {
        ...authorMeetingCommentsPopulate,
      },
    });
  }

  async getComments(
    noteId: string,
    user: UserPayloadInterface,
    query: GetMeetingCommentsQueryDto,
  ): Promise<GetMeetingCommentResponseDto[]> {
    await this.checkGetCreateAccess(noteId, user);

    const where: Prisma.MeetingCommentWhereInput = {
      meetingNoteId: noteId,
      parentId: null,
    };

    if (query.type) {
      where.type = query.type;
    }

    return this.prisma.meetingComment.findMany({
      where,
      select: {
        ...selectMeetingCommentsPopulate,
        replies: {
          select: {
            ...selectMeetingCommentsPopulate,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createReply(
    noteId: string,
    parentId: string,
    dto: CreateCommentDto,
    user: UserPayloadInterface,
  ) {
    const parent = await this.prisma.meetingComment.findUnique({ where: { id: parentId } });
    if (!parent)
      throw new NotFoundException(
        errorMessages.NotFoundException.PARENT_MEETING_COMMENTS_NOT_FOUND(),
      );

    await this.checkGetCreateAccess(noteId, user);

    return this.prisma.meetingComment.create({
      data: {
        content: dto.content,
        from: dto.from,
        to: dto.to,
        editorDataCommentId: dto.editorDataCommentId,
        type: dto.type,
        meetingNoteId: noteId,
        authorId: user.userId,
        parentId,
      },
      include: {
        ...authorMeetingCommentsPopulate,
      },
    });
  }

  async updateComment(commentId: string, dto: UpdateCommentDto, user: UserPayloadInterface) {
    const comment = await this.prisma.meetingComment.findUnique({ where: { id: commentId } });
    if (!comment)
      throw new NotFoundException(errorMessages.NotFoundException.MEETING_COMMENTS_NOT_FOUND());
    if (comment.authorId !== user.userId)
      throw new ForbiddenException(
        errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_COMMENT(),
      );

    const data: Partial<
      Pick<
        UpdateCommentDto,
        'content' | 'from' | 'to' | 'editorDataCommentId' | 'resolved' | 'type'
      >
    > = {};

    if (dto.content !== undefined) data.content = dto.content;
    if (dto.from !== undefined) data.from = dto.from;
    if (dto.to !== undefined) data.to = dto.to;
    if (dto.editorDataCommentId !== undefined) data.editorDataCommentId = dto.editorDataCommentId;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.resolved !== undefined) data.resolved = dto.resolved;

    if (Object.keys(data).length === 0) {
      throw new NotFoundException(errorMessages.NotFoundException.NO_FIELDS_TO_UPDATE());
    }

    return this.prisma.meetingComment.update({
      where: { id: commentId },
      data,
      include: {
        ...authorMeetingCommentsPopulate,
      },
    });
  }

  async deleteComment(commentId: string, user: UserPayloadInterface) {
    const comment = await this.prisma.meetingComment.findUnique({ where: { id: commentId } });
    if (!comment)
      throw new NotFoundException(errorMessages.NotFoundException.MEETING_COMMENTS_NOT_FOUND());

    const note = await this.prisma.meetingNote.findUnique({
      where: { id: comment.meetingNoteId, companyId: user.companyId },
    });

    if (!note) {
      throw new NotFoundException(errorMessages.NotFoundException.MEETING_NOTE_NOT_FOUND());
    }
    const isNoteMeetingOwner = note.authorId === user.userId;
    const isCommentAuthor = comment.authorId === user.userId;

    if (isNoteMeetingOwner || isCommentAuthor) {
      await this.prisma.meetingComment.delete({ where: { id: commentId } });
      return { success: true };
    }

    throw new ForbiddenException(
      errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_COMMENT(),
    );
  }

  private async checkGetCreateAccess(noteId: string, user: UserPayloadInterface): Promise<void> {
    const note = await this.prisma.meetingNote.findUnique({
      where: { id: noteId, companyId: user.companyId },
      include: getMeetingNoteByIdPopulate(user.companyId),
    });

    if (!note) {
      throw new NotFoundException(errorMessages.NotFoundException.MEETING_NOTE_NOT_FOUND());
    }

    const isAuthor = note.authorId === user.userId;
    const isParticipant = note.participantsInSystem.some((p) => p.user.user.id === user.userId);

    if (!isAuthor && !isParticipant) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_NOTE(),
      );
    }
  }
}
