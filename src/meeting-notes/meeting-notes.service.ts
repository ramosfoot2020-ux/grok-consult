import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { randomBytes, createHash } from 'crypto';
import { RRule } from 'rrule';

import { Cache } from 'cache-manager';
import {
  Prisma,
  MeetingInteractionStatus,
  Roles,
  AssetType,
  AssetStatus,
  $Enums,
} from '@prisma/client';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { errorMessages } from '@src/common/error-messages';
import { EmailService } from '@src/common/services/email.service';
import { MeetingNoteScope } from '@src/meeting-notes/enums/meeting-notes-scope.enum';
import { getAllMeetingNotesPopulate } from '@src/meeting-notes/populate/get-all-meeting-notest-populate';
import { AdditionalBlockDto } from '@src/meeting-notes/dto/additional-block.dto';
import { GenerateAssetUploadUrlDto } from '@src/upload/dto/generate-asset-upload-url.dto';
import {
  UpdateMeetingNoteDto,
  UpdateParticipantInSystemDto,
} from '@src/meeting-notes/dto/update-meeting-notes.dto';
import { getMeetingNoteByIdPopulate } from '@src/meeting-notes/populate/get-meeting-note-bu-id-populate';
import { UploadsService } from '@src/upload/uploads.service';
import { FilesRouteEnum } from '@src/upload/enums/upload-routes.enum';
import { MeetingNoteResponseDto } from '@src/meeting-notes/dto/responses/get-meeting-note-bu-id.reponse.dto';
import { TogglePublicSharingDto } from '@src/meeting-notes/dto/toggle-public-sharing.dto';
import { GetRecurringMeetingDto } from '@src/meeting-notes/dto/get-recurring-meeting.dto';
import { SummarizationService } from '@src/summarization/summarization.service';
import {
  SummaryPointDto,
  SummaryWithCitationsDto,
} from '@src/summarization/dto/responses/summary.responses.dto';
import { SegmentDto } from '@src/summarization/dto/transcription.dto';
import { GenerateSummaryDto } from '@src/meeting-notes/dto/responses/generate-summary.dto';
import { UploadTranscriptionDto } from '@src/meeting-notes/dto/responses/upload-transcription.dto';
import { LocaleEnum } from '@src/common/enums/locale.enum';
import {
  localizedNoItemsMessage,
  localizedSectionTitles,
} from '@src/meeting-notes/utils/summary-locale-section-titles';
import { mapMeetingTypeToTemplateEnum } from '@src/meeting-notes/utils/type-to-template';
import { TokenUsage } from '@src/langchain/token-usage-callback';
import { summaryFindUniquePopulate } from '@src/meeting-notes/populate/summary-find-unique-populate';
import { validTipTapBlockType } from '@src/meeting-notes/utils/valid-tiptap-block-type';
import { convertSummaryToTiptap } from '@src/meeting-notes/utils/convert-summary-to-tiptap';
import { convertMarkdownBlockToTiptap } from '@src/meeting-notes/utils/convert-mardown-to-tiptap';

import { CreateMeetingNoteDto } from './dto/create-meeting-note.dto';
import { UpdateRecurringMeetingDto } from './dto/update-recurring-meeting.dto';
import { DeleteRecurringMeetingDto } from './dto/delete-recurring-meeting.dto';
import { GetAllMeetingNotesQueryDto } from './dto/get-all-meeting-notes.query.dto';
import { ParticipantInSystemInterface } from './interfaces/participant-in-system.interface';

const MAX_ASSET_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
const ALLOWED_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/aac',
]);

const MAX_YEARS_AHEAD = 2;
const SUBJECT_EMAIL_CREATE_MEETING_NOTE = 'Meeting Note';
const CONTENT_EMAIL_CREATE_MEETING_NOTE = `Meeting Note series created`;

const meetingNoteWithDetailsArgs = Prisma.validator<Prisma.MeetingNoteDefaultArgs>()({
  include: getMeetingNoteByIdPopulate(''),
});

export type MeetingNoteWithDetails = Prisma.MeetingNoteGetPayload<
  typeof meetingNoteWithDetailsArgs
>;

const assetWithNotesArgs = Prisma.validator<Prisma.MeetingAssetDefaultArgs>()({
  include: {
    meetingNotes: {
      select: { meetingNoteId: true },
    },
  },
});

type AssetWithNotesPayload = Prisma.MeetingAssetGetPayload<typeof assetWithNotesArgs>;

@Injectable()
export class MeetingNotesService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly userCompaniesService: UserCompaniesService,
    private readonly uploadsService: UploadsService,
    private readonly summarizationService: SummarizationService,
  ) {}

  async createMeetingNote(dto: CreateMeetingNoteDto, user: UserPayloadInterface) {
    const participantsToCreate = await this.validateAndFetchParticipants(
      dto.participantsInSystem,
      user,
    );

    const start = dayjs(dto.startDate);
    const end = dayjs(dto.endDate);
    const duration = end.diff(start, 'minute');

    if (dto.labelIds?.length) {
      const validLabelsCount = await this.prisma.label.count({
        where: {
          id: { in: dto.labelIds },
          companyId: user.companyId,
        },
      });

      if (validLabelsCount !== dto.labelIds.length) {
        throw new BadRequestException(errorMessages.BadRequestException.LABEL_NOT_EXISTS());
      }
    }

    const baseData = {
      startDate: start.toDate(),
      endDate: end.toDate(),
      duration,
      name: dto.name,
      type: dto.type,
      area: dto.area,
      companyId: user.companyId,
      authorId: user.userId,
      location: dto.location,
      participantsInSystem: {
        create: participantsToCreate.map((participant) => ({ userId: participant.id })),
      },
      participantsOutSystem: {
        create:
          dto.participantsOutSystem?.map((email) => ({
            email: email,
          })) || [],
      },
      additionalBlocks: dto.additionalBlocks,
      additionalBlocksAfter: dto.additionalBlocksAfter,
      labels: {
        create: dto.labelIds?.map((labelId) => ({
          label: {
            connect: { id: labelId },
          },
        })),
      },
    };

    //////////////////////
    // start if dto.recurring
    if (dto.recurring?.rruleData) {
      let rule: RRule;
      try {
        rule = RRule.fromString(dto.recurring.rruleData);
      } catch (e) {
        throw new BadRequestException(errorMessages.BadRequestException.INVALID_RRULE_OPTIONS());
      }

      const occurrences = rule.all();

      // limit 2 years ahead
      const maxDate = dayjs().add(MAX_YEARS_AHEAD, 'year');
      const limitedOccurrences = occurrences.filter((d) => dayjs(d).isBefore(maxDate));

      if (limitedOccurrences.length === 0) {
        throw new NotFoundException(
          errorMessages.NotFoundException.NO_OCCURRENCES_TO_CREATE_MEETINGS(),
        );
      }

      const result = await this.prisma.$transaction(
        async (tx) => {
          const recurringRec = await tx.recurringMeeting.create({
            data: {
              name: dto.name,
              rruleData: dto.recurring?.rruleData,
              authorId: user.userId,
              companyId: user.companyId,
            },
          });

          const createPromises = limitedOccurrences.map((occ) => {
            const start = occ;
            const end = dayjs(start).add(duration, 'minute').toDate();

            return tx.meetingNote.create({
              data: {
                ...baseData,
                startDate: start,
                endDate: end,
                recurringMeetingId: recurringRec.id,
              },
            });
          });

          try {
            const createdNotes = await Promise.all(createPromises);
            return { recurring: recurringRec, notes: createdNotes };
          } catch (err) {
            console.error(errorMessages.BadRequestException.FAILED_CREATE_RECURRING(), err);
            throw new BadRequestException(
              errorMessages.BadRequestException.FAILED_CREATE_RECURRING(),
            );
          }
        },
        {
          timeout: 20000,
        },
      );

      if (result && result.notes && result.notes.length > 0) {
        // send emails if participantsOutSystem exist
        if (dto?.participantsOutSystem?.length) {
          await this.emailService.sendEmail({
            to: dto.participantsOutSystem,
            subject: SUBJECT_EMAIL_CREATE_MEETING_NOTE,
            text: CONTENT_EMAIL_CREATE_MEETING_NOTE,
          });
        }

        const firstNote = result.notes[0]!;

        return this.getMeetingNoteById(firstNote.id, user);
      }

      throw new BadRequestException(errorMessages.BadRequestException.INCORRECT_CREATE_RECURRING());
    }
    // end if dto.recurring
    ///////////////

    const meetingNote = await this.prisma.meetingNote.create({
      data: baseData,
    });

    if (dto?.participantsOutSystem?.length) {
      await this.emailService.sendEmail({
        to: dto.participantsOutSystem,
        subject: SUBJECT_EMAIL_CREATE_MEETING_NOTE,
        text: CONTENT_EMAIL_CREATE_MEETING_NOTE,
      });
    }

    return this.getMeetingNoteById(meetingNote.id, user);
  }

  async getMeetingNoteById(id: string, user: UserPayloadInterface) {
    const meetingNote = await this.prisma.meetingNote.findUnique({
      where: {
        id,
        companyId: user.companyId,
      },
      include: getMeetingNoteByIdPopulate(user.companyId),
    });

    if (!meetingNote) {
      throw new NotFoundException(errorMessages.NotFoundException.MEETING_NOTE_NOT_FOUND());
    }

    // permissions (Role based access control skip for now due documentation)
    // const userCompanyInfo = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
    //   user.userId,
    //   user.companyId,
    // );
    //
    // const requesterRole = userCompanyInfo?.role;

    const isAuthor = meetingNote.authorId === user.userId;
    const isParticipant = meetingNote.participantsInSystem.some(
      (p) => p.user.user.id === user.userId,
    );

    if (!isAuthor && !isParticipant) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_NOTE(),
      );
    }

    const authorRole = meetingNote.author.userCompanies[0]?.role;

    if (!authorRole) {
      throw new NotFoundException(errorMessages.BadRequestException.USER_NOT_HAVE_ROLE());
    }

    return this.buildMeetingNoteResponse(meetingNote);
  }

  async getNoteForSharedUser(id: string, user: UserPayloadInterface) {
    const meetingNote = await this.prisma.meetingNote.findUnique({
      where: {
        id,
        companyId: user.companyId,
      },
      include: getMeetingNoteByIdPopulate(user.companyId),
    });

    if (!meetingNote) {
      throw new NotFoundException(errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_NOTE());
    }

    const isSharedUser = meetingNote.shares.some((s) => s.user.id === user.userId);

    if (!isSharedUser) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_NOTE(),
      );
    }

    const response = this.buildMeetingNoteResponse(meetingNote);

    return {
      ...response,
      additionalBlocks: [],
    };
  }

  async getNoteByPublicSlug(slug: string) {
    const meetingNote = await this.prisma.meetingNote.findFirst({
      where: {
        publicSlug: slug,
        publicUntil: {
          gte: new Date(),
        },
      },
      select: {
        additionalBlocksAfter: true,
        publicSlug: true,
        publicUntil: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        type: true,
      },
    });

    if (!meetingNote) {
      throw new NotFoundException('Public meeting note not found or access has expired.');
    }

    return meetingNote;
  }

  async getAllMeetingNotes(user: UserPayloadInterface, query: GetAllMeetingNotesQueryDto) {
    const userCompanyInfo = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      user.userId,
      user.companyId,
    );

    if (!userCompanyInfo) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const scopeToApply = query?.scope ?? MeetingNoteScope.MY_NOTES;

    if (scopeToApply === MeetingNoteScope.ALL_SPACE_NOTES && userCompanyInfo.role !== Roles.OWNER) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_NOTE(),
      );
    }

    const meetingNotesWhere: Prisma.MeetingNoteWhereInput = {
      companyId: user.companyId,
      ...this.buildScopeFilter(user.userId, scopeToApply),
    };

    if (query.type?.length) {
      meetingNotesWhere.type = { in: query.type };
    }

    if (query.startDate && query.endDate) {
      meetingNotesWhere.AND = [
        { startDate: { lte: new Date(query.endDate) } },
        { endDate: { gte: new Date(query.startDate) } },
      ];
    } else if (query.startDate) {
      meetingNotesWhere.startDate = { gte: new Date(query.startDate) };
    } else if (query.endDate) {
      meetingNotesWhere.endDate = { lte: new Date(query.endDate) };
    }

    if (query.participantsOutSystem?.length) {
      meetingNotesWhere.participantsOutSystem = {
        some: {
          email: {
            in: query.participantsOutSystem,
          },
        },
      };
    }

    if (query.labels?.length) {
      meetingNotesWhere.labels = {
        some: {
          labelId: {
            in: query.labels,
          },
        },
      };
    }

    // TODO:Clarify if we need to filter by participantsInSystem and see all meeting notes without users
    if (query.participantsInSystem?.length) {
      meetingNotesWhere.participantsInSystem = {
        some: {
          user: {
            userId: {
              in: query.participantsInSystem,
            },
          },
        },
      };
    }

    if (query.search) {
      meetingNotesWhere.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.interactionStatus?.length) {
      meetingNotesWhere.interactionStatus = { in: query.interactionStatus };
    }

    if (!query.isHidden) {
      meetingNotesWhere.isHidden = false;
    }

    const meetingNotesAttentionWhere: Prisma.MeetingNoteWhereInput = {
      companyId: user.companyId,
      endDate: { lte: new Date() },
      interactionStatus: MeetingInteractionStatus.PENDING,
      authorId: user.userId,
    };

    const [total, attentionTotal, meetingNotes] = await this.prisma.$transaction([
      this.prisma.meetingNote.count({ where: meetingNotesWhere }),
      this.prisma.meetingNote.count({ where: meetingNotesAttentionWhere }),
      this.prisma.meetingNote.findMany({
        where: meetingNotesWhere,
        select: getAllMeetingNotesPopulate(user.companyId),
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formattedMeetingNotes = meetingNotes.map((note) => {
      const authorRole = note.author.userCompanies[0]?.role;
      const author = {
        ...note.author,
        role: authorRole,
        userCompanies: undefined,
      };

      const formattedParticipantsInSystem = note.participantsInSystem.map((p) => ({
        id: p.user.user.id,
        status: p.status,
        firstName: p.user.user.firstName,
        lastName: p.user.user.lastName,
        email: p.user.user.email,
        avatar: p.user.user.avatar,
      }));

      const additionalBlocks = note.additionalBlocks as unknown as AdditionalBlockDto[];
      const additionalBlocksAfter = note.additionalBlocksAfter as unknown as AdditionalBlockDto[];

      const formattedAssets = note.assets.map((link) => ({
        id: link.meetingAsset.id,
        type: link.meetingAsset.type,
        fileName: link.meetingAsset.fileName,
        hasTranscription: !!link.meetingAsset.transcription,
      }));

      const formattedLabels = note.labels.map((l) => ({
        id: l.label.id,
        name: l.label.name,
      }));

      const formattedRecurringMeeting = note.recurringMeeting
        ? {
            id: note.recurringMeeting.id,
            name: note.recurringMeeting.name,
            rruleData: note.recurringMeeting.rruleData,
            authorId: note.recurringMeeting.authorId,
            companyId: note.recurringMeeting.companyId,
            createdAt: note.recurringMeeting.createdAt,
          }
        : null;

      return {
        ...note,
        author,
        participantsInSystem: formattedParticipantsInSystem,
        additionalBlocks,
        additionalBlocksAfter,
        assets: formattedAssets,
        labels: formattedLabels,
        recurringMeeting: formattedRecurringMeeting,
      };
    });

    return {
      meetingNotes: formattedMeetingNotes,
      total,
      attentionTotal,
    };
  }

  async updateMeetingNote(id: string, dto: UpdateMeetingNoteDto, user: UserPayloadInterface) {
    const existingNote = await this.prisma.meetingNote.findUnique({
      where: { id, companyId: user.companyId },
      include: {
        author: {
          select: {
            userCompanies: {
              where: { companyId: user.companyId },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!existingNote) {
      throw new NotFoundException(errorMessages.NotFoundException.MEETING_NOTE_NOT_FOUND());
    }

    const requesterUserCompany = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      user.userId,
      user.companyId,
    );

    const requesterRole = requesterUserCompany?.role;
    const authorRole = existingNote.author.userCompanies[0]?.role;

    const isOwner = requesterRole === Roles.OWNER;
    const isManagerEditingNonOwner =
      requesterRole === Roles.COMPANY_MANAGER && authorRole !== Roles.OWNER;
    const isAuthor = existingNote.authorId === user.userId;

    const canEdit = isOwner || isManagerEditingNonOwner || isAuthor;

    if (!canEdit) {
      throw new ForbiddenException(
        errorMessages.BadRequestException.CANNOT_CHANGE_DATA_OF_DIFFERENT_USER(),
      );
    }

    const { participantsInSystem, participantsOutSystem, shares, labelIds, ...restOfDto } = dto;

    const data: Prisma.MeetingNoteUpdateInput = { ...restOfDto };

    if (participantsOutSystem) {
      data.participantsOutSystem = {
        deleteMany: {},
        create: participantsOutSystem.map((p) => ({
          email: p.email,
          status: p.status,
        })),
      };
    }

    if (participantsInSystem) {
      const userIdsToValidate = participantsInSystem.map(
        (p: UpdateParticipantInSystemDto) => p.userId,
      );

      const validatedParticipants = await this.validateAndFetchParticipants(
        userIdsToValidate,
        user,
      );

      const userIdToStatusMap = new Map(participantsInSystem.map((p) => [p.userId, p.status]));

      data.participantsInSystem = {
        deleteMany: {},
        create: validatedParticipants.map((p) => ({
          userId: p.id,
          status: userIdToStatusMap.get(p.userId) || 'ABSENT',
        })),
      };
    }

    if (shares) {
      const validatedUserIds = await this.validateSharedUsers(shares, user.companyId);

      data.shares = {
        deleteMany: {},
        create: validatedUserIds.map((userId) => ({
          userId: userId,
        })),
      };
    }

    if (labelIds) {
      if (labelIds.length > 0) {
        const validLabelsCount = await this.prisma.label.count({
          where: {
            id: { in: labelIds },
            companyId: user.companyId,
          },
        });

        if (validLabelsCount !== labelIds.length) {
          throw new BadRequestException(errorMessages.BadRequestException.LABEL_NOT_EXISTS());
        }
      }

      data.labels = {
        deleteMany: {},
        create: labelIds.map((id) => ({
          labelId: id,
        })),
      };
    }

    if (dto.startDate && dto.endDate) {
      const newStartDate = dto.startDate ? dayjs(dto.startDate) : dayjs(existingNote.startDate);
      const newEndDate = dto.endDate ? dayjs(dto.endDate) : dayjs(existingNote.endDate);

      data.startDate = newStartDate.toDate();
      data.endDate = newEndDate.toDate();
      data.duration = newEndDate.diff(newStartDate, 'minute');
    }

    if (existingNote.interactionStatus === MeetingInteractionStatus.PENDING) {
      data.interactionStatus = MeetingInteractionStatus.MANUALLY_REVIEWED;
    }

    await this.prisma.meetingNote.update({
      where: { id },
      data,
    });

    return this.getMeetingNoteById(id, user);
  }

  async updateRecurringMeetingChain(
    recurringId: string,
    dto: UpdateRecurringMeetingDto,
    user: UserPayloadInterface,
  ) {
    const recurring = await this.prisma.recurringMeeting.findUnique({
      where: { id: recurringId },
    });

    if (!recurring || recurring.companyId !== user.companyId) {
      throw new NotFoundException(errorMessages.NotFoundException.RECURRING_MEETING_NOT_FOUND());
    }

    // get notes in period
    const dateFilter: Prisma.DateTimeFilter = { gt: dayjs().toDate() };

    if (dto.startDatePeriod) {
      const start = dayjs(dto.startDatePeriod);
      if (!start.isValid())
        throw new BadRequestException(errorMessages.BadRequestException.INVALID_STARTDATE_PERIOD());
      dateFilter.gte = start.toDate();
    }

    if (dto.endDatePeriod) {
      const end = dayjs(dto.endDatePeriod);
      if (!end.isValid())
        throw new BadRequestException(errorMessages.BadRequestException.INVALID_ENDDATE_PERIOD());
      dateFilter.lte = end.toDate();
    }

    const notes = await this.prisma.meetingNote.findMany({
      where: {
        recurringMeetingId: recurring.id,
        companyId: user.companyId,
        startDate: dateFilter,
      },
      include: {
        author: {
          select: {
            userCompanies: {
              where: { companyId: user.companyId },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!notes.length) {
      throw new NotFoundException(errorMessages.NotFoundException.NO_MEETINGS_FOUND());
    }

    // Create map
    const notesMap = new Map(notes.map((n) => [n.id, n]));

    // CHECK PERMISSIONS ONCE
    const requester = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      user.userId,
      user.companyId,
    );

    const requesterRole = requester?.role;

    for (const note of notes) {
      const authorRole = note.author.userCompanies[0]?.role;

      const isOwner = requesterRole === Roles.OWNER;
      const isManagerEditingNonOwner =
        requesterRole === Roles.COMPANY_MANAGER && authorRole !== Roles.OWNER;
      const isAuthor = note.authorId === user.userId;

      if (!isOwner && !isManagerEditingNonOwner && !isAuthor) {
        throw new ForbiddenException(
          errorMessages.BadRequestException.CANNOT_CHANGE_DATA_OF_DIFFERENT_USER(),
        );
      }
    }

    const updateData = dto.updateData ?? {};

    // validate  labelIds
    if (updateData.labelIds?.length) {
      const validLabelsCount = await this.prisma.label.count({
        where: {
          id: { in: updateData.labelIds },
          companyId: user.companyId,
        },
      });

      if (validLabelsCount !== updateData.labelIds.length) {
        throw new BadRequestException(errorMessages.BadRequestException.LABEL_NOT_EXISTS());
      }
    }

    // validate participants & shares
    let validatedParticipants: ParticipantInSystemInterface[];
    let userIdToStatusMap: Map<string, $Enums.AttendanceStatus>;
    if (updateData.participantsInSystem) {
      const userIdsToValidate = updateData.participantsInSystem.map(
        (p: UpdateParticipantInSystemDto) => p.userId,
      );
      validatedParticipants = await this.validateAndFetchParticipants(userIdsToValidate, user);
      userIdToStatusMap = new Map(updateData.participantsInSystem.map((p) => [p.userId, p.status]));
    }

    let validatedUserIds: string[];
    if (updateData.shares) {
      validatedUserIds = await this.validateSharedUsers(updateData.shares, user.companyId);
    }

    // BUILD BATCH UPDATE DTOs
    const batchUpdates: { id: string; dto: UpdateMeetingNoteDto }[] = notes.map((note) => ({
      id: note.id,
      dto: updateData,
    }));

    // BUILD UPDATE PROMISES
    const updatePromises = batchUpdates.map((item) => {
      const existing = notesMap.get(item.id)!;
      const updateDto = item.dto;

      const { participantsInSystem, participantsOutSystem, shares, labelIds, ...restFields } =
        updateDto;

      const data: Prisma.MeetingNoteUpdateInput = {
        ...restFields,
      };

      // Date & duration logic
      if (updateDto.startDate || updateDto.endDate) {
        const dtoStart = updateDto.startDate ? dayjs(updateDto.startDate) : null;
        const dtoEnd = updateDto.endDate ? dayjs(updateDto.endDate) : null;

        if ((dtoStart && !dtoStart.isValid()) || (dtoEnd && !dtoEnd.isValid())) {
          throw new BadRequestException(errorMessages.BadRequestException.INVALID_DATES());
        }

        const originalStart = dayjs(existing.startDate);
        const originalEnd = dayjs(existing.endDate);

        const newStartDate = dtoStart
          ? originalStart
              .hour(dtoStart.hour())
              .minute(dtoStart.minute())
              .second(0)
              .millisecond(0)
              .toDate()
          : existing.startDate;

        const newEndDate = dtoEnd
          ? originalEnd
              .hour(dtoEnd.hour())
              .minute(dtoEnd.minute())
              .second(0)
              .millisecond(0)
              .toDate()
          : existing.endDate;

        if (dtoStart) data.startDate = newStartDate;
        if (dtoEnd) data.endDate = newEndDate;

        const finalStart = dayjs(dtoStart ? newStartDate : existing.startDate);
        const finalEnd = dayjs(dtoEnd ? newEndDate : existing.endDate);

        if (finalStart.isValid() && finalEnd.isValid() && finalEnd.isAfter(finalStart)) {
          data.duration = finalEnd.diff(finalStart, 'minute');
        } else if (finalStart.isValid() && finalEnd.isValid()) {
          // if end <= start — maybe error but not interruption
          data.duration = 0;
        }
      }

      if (existing.interactionStatus === MeetingInteractionStatus.PENDING && updateDto) {
        data.interactionStatus = MeetingInteractionStatus.MANUALLY_REVIEWED;
      }

      const operations: Prisma.MeetingNoteUpdateArgs = {
        where: { id: item.id },
        data,
      };

      // participants, shares
      if (updateData.participantsOutSystem !== undefined) {
        operations.data = {
          ...operations.data,
          participantsOutSystem: {
            deleteMany: {},
            create:
              updateData.participantsOutSystem?.map((p) => ({
                email: p.email,
                status: p.status,
              })) ?? [],
          },
        };
      }

      if (updateData.participantsInSystem !== undefined) {
        operations.data = {
          ...operations.data,
          participantsInSystem: {
            deleteMany: {},
            create: validatedParticipants.map((u) => ({
              userId: u.id,
              status: userIdToStatusMap.get(u.id) || 'ABSENT',
            })),
          },
        };
      }

      if (updateData.shares !== undefined) {
        operations.data = {
          ...operations.data,
          shares: {
            deleteMany: {},
            create: validatedUserIds.map((uid) => ({
              userId: uid,
            })),
          },
        };
      }

      if (updateData.labelIds !== undefined) {
        operations.data = {
          ...operations.data,
          labels: {
            deleteMany: {},
            create: updateData.labelIds.map((id) => ({
              labelId: id,
            })),
          },
        };
      }

      return this.prisma.meetingNote.update(operations);
    });

    try {
      await this.prisma.$transaction(updatePromises);
      return { success: true };
    } catch (err) {
      console.error(errorMessages.BadRequestException.FAILED_UPDATE_RECURRING(), err);
      throw new BadRequestException(errorMessages.BadRequestException.FAILED_UPDATE_RECURRING());
    }
  }

  async deleteRecurringMeetingChain(
    recurringId: string,
    dto: DeleteRecurringMeetingDto,
    user: UserPayloadInterface,
  ) {
    const recurring = await this.prisma.recurringMeeting.findUnique({
      where: { id: recurringId },
    });

    if (!recurring || recurring.companyId !== user.companyId) {
      throw new NotFoundException(errorMessages.NotFoundException.RECURRING_MEETING_NOT_FOUND());
    }

    if (recurring.authorId !== user.userId) {
      throw new BadRequestException(
        errorMessages.BadRequestException.CAN_NOT_DELETE_RECURRING_OWNED_BY_OTHER(),
      );
    }

    // get notes in period
    const dateFilter: Prisma.DateTimeFilter = { gt: dayjs().toDate() };

    if (dto.startDatePeriod) {
      const d = dayjs(dto.startDatePeriod);
      if (!d.isValid())
        throw new BadRequestException(errorMessages.BadRequestException.INVALID_STARTDATE_PERIOD());
      dateFilter.gte = d.toDate();
    }

    if (dto.endDatePeriod) {
      const d = dayjs(dto.endDatePeriod);
      if (!d.isValid())
        throw new BadRequestException(errorMessages.BadRequestException.INVALID_ENDDATE_PERIOD());
      dateFilter.lte = d.toDate();
    }

    // find notes in period
    const notes = await this.prisma.meetingNote.findMany({
      where: {
        recurringMeetingId: recurring.id,
        companyId: user.companyId,
        ...(Object.keys(dateFilter).length ? { startDate: dateFilter } : {}),
      },
      select: { id: true },
    });

    if (!notes.length) {
      throw new NotFoundException(errorMessages.NotFoundException.NO_MEETINGS_FOUND());
    }

    const noteIds = notes.map((n) => n.id);

    const authors = await this.prisma.meetingNote.findMany({
      where: { id: { in: noteIds } },
      select: {
        id: true,
        authorId: true,
        author: {
          select: {
            userCompanies: {
              where: { companyId: user.companyId },
              select: { role: true },
            },
          },
        },
      },
    });

    for (const note of authors) {
      if (note.authorId !== user.userId) {
        throw new BadRequestException(
          errorMessages.BadRequestException.CAN_NOT_DELETE_MEETING_NOTE_OWNED_BY_OTHER(),
        );
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      const deleteNotePromises = noteIds.map((id) =>
        tx.meetingNote.delete({
          where: { id },
        }),
      );

      await Promise.all(deleteNotePromises);

      // if not exist period delete recurringMeeting
      const fullDelete = !dto.startDatePeriod && !dto.endDatePeriod;

      if (fullDelete) {
        await tx.recurringMeeting.delete({
          where: { id: recurringId },
        });
      }

      return { success: true };
    });
  }

  async deleteMeetingNote(id: string, user: UserPayloadInterface) {
    const meetingNote = await this.getMeetingNoteById(id, user);

    if (meetingNote.author.id !== user.userId) {
      throw new BadRequestException(
        errorMessages.BadRequestException.CAN_NOT_DELETE_MEETING_NOTE_OWNED_BY_OTHER(),
      );
    }

    await this.prisma.meetingNote.delete({
      where: { id },
    });

    return { success: true };
  }

  async generateAssetUploadUrl(
    noteId: string,
    dto: GenerateAssetUploadUrlDto,
    user: UserPayloadInterface,
  ) {
    if (dto.fileSize > MAX_ASSET_SIZE_BYTES) {
      throw new BadRequestException(
        `File size cannot exceed ${MAX_ASSET_SIZE_BYTES / 1024 / 1024}MB.`,
      );
    }
    if (!ALLOWED_MIME_TYPES.has(dto.fileType)) {
      throw new BadRequestException(`File type '${dto.fileType}' is not supported.`);
    }

    await this.authorizeNoteAccess(noteId, user.userId);

    const uniqueFileId = randomBytes(16).toString('hex');
    const s3Key = `${FilesRouteEnum['MEETING_NOTES']}/${noteId}/assets/${uniqueFileId}/${dto.fileName}`;

    const newAsset = await this.prisma.meetingAsset.create({
      data: {
        type: this.getAssetTypeFromFileType(dto.fileType),
        status: 'COMPLETED',
        fileName: dto.fileName,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
        storageKey: s3Key,
        url: `https://${this.uploadsService.privateBucketName}.s3.${this.uploadsService.region}.amazonaws.com/${s3Key}`,
        meetingNotes: {
          create: [{ meetingNoteId: noteId }],
        },
      },
    });

    const { presignedUrl } = await this.uploadsService.getPresignedUrl({
      bucket: this.uploadsService.privateBucketName,
      s3Key: s3Key,
      fileType: dto.fileType,
    });

    return {
      presignedUrl,
      assetId: newAsset.id,
    };
  }

  async getAssetAccessUrl(noteId: string, assetId: string, user: UserPayloadInterface) {
    await this.authorizeNoteAccess(noteId, user.userId);

    const asset = await this.prisma.meetingAsset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found.');
    }
    if (asset.status !== 'COMPLETED') {
      throw new BadRequestException('Asset is still processing and not available for viewing.');
    }

    const { presignedUrl } = await this.uploadsService.getPresignedUrlForDownload({
      bucket: this.uploadsService.privateBucketName,
      s3Key: asset.storageKey,
    });

    return {
      presignedUrl,
      transcription: asset.transcription,
      structuredTranscription: asset.structuredTranscription,
    };
  }

  async togglePublicSharing(
    noteId: string,
    dto: TogglePublicSharingDto,
    user: UserPayloadInterface,
  ) {
    const note = await this.prisma.meetingNote.findUnique({
      where: { id: noteId, companyId: user.companyId },
    });

    if (!note || note.authorId !== user.userId) {
      throw new ForbiddenException(errorMessages.BadRequestException.DONT_HAVE_ACCESS());
    }

    const requesterUserCompany = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      user.userId,
      user.companyId,
    );

    const requesterRole = requesterUserCompany?.role;

    const isOwner = requesterRole === Roles.OWNER;
    const isManager = requesterRole === Roles.OWNER;
    const isAuthor = note.authorId === user.userId;

    const canEdit = isOwner || isManager || isAuthor;

    if (!canEdit) {
      throw new ForbiddenException(
        errorMessages.BadRequestException.CANNOT_CHANGE_DATA_OF_DIFFERENT_USER(),
      );
    }

    const slug = dto.isPublic ? note.publicSlug || randomBytes(16).toString('hex') : null;

    const expiryDate = dto.isPublic ? dayjs().add(7, 'days').toDate() : null;

    await this.prisma.meetingNote.update({
      where: { id: noteId },
      data: {
        publicSlug: slug,
        publicUntil: expiryDate,
      },
    });

    return {
      publicUrl: dto.isPublic
        ? `${process.env.APP_CLIENT_URL}/${dto.locale}/public-meeting/${slug}/after`
        : null,
    };
  }

  async getStructuredTranscriptionByAssetId(assetId: string, user: UserPayloadInterface) {
    const asset: AssetWithNotesPayload | null = await this.prisma.meetingAsset.findUnique({
      where: { id: assetId },
      include: {
        meetingNotes: {
          select: { meetingNoteId: true },
          take: 1,
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found.');
    }

    const associatedNoteLink = asset.meetingNotes?.[0];

    if (!associatedNoteLink) {
      throw new ForbiddenException('Asset is not associated with any meeting note.');
    }

    const noteId = associatedNoteLink.meetingNoteId;
    await this.authorizeNoteAccess(noteId, user.userId);

    if (!asset.structuredTranscription || !Array.isArray(asset.structuredTranscription)) {
      throw new NotFoundException('Structured transcription is not available for this asset.');
    }

    return asset.structuredTranscription as unknown as SegmentDto[];
  }

  async generateSummaryFromAsset(
    noteId: string,
    dto: GenerateSummaryDto,
    user: UserPayloadInterface,
  ) {
    await this.authorizeNoteAccess(noteId, user.userId);

    const meetingNote = await this.prisma.meetingNote.findUnique({
      where: { id: noteId },
      include: summaryFindUniquePopulate,
    });

    if (!meetingNote) {
      throw new NotFoundException('Meeting note not found.');
    }

    const validAssets = meetingNote.assets
      .map((link) => link.meetingAsset)
      .filter(
        (asset) =>
          asset &&
          Array.isArray(asset.structuredTranscription) &&
          asset.structuredTranscription.length > 0,
      );

    if (validAssets.length === 0) {
      throw new BadRequestException(
        errorMessages.BadRequestException.NO_ASSETS_WITH_VALID_TRANSCRIPTION(),
      );
    }
    const assetIds = validAssets.map((a) => a.id).sort();

    const keyData = JSON.stringify({
      noteId,
      locale: dto.locale,
      type: meetingNote.type,
      assetIds,
    });
    const cacheKey = `summary-gen-status-${createHash('sha256').update(keyData).digest('hex')}`;

    const isAlreadyGenerated = await this.cacheManager.get(cacheKey);

    if (isAlreadyGenerated) {
      return this.getMeetingNoteById(noteId, user);
    }

    const templateFromType = mapMeetingTypeToTemplateEnum(meetingNote.type);

    const individualSummaries: SummaryWithCitationsDto[] = [];
    for (const asset of validAssets) {
      let summaryDto: SummaryWithCitationsDto;

      // Check if a valid summary already exists and use it (caching)
      if (asset.summary && asset.summary.templateUsed === meetingNote.type) {
        const usageFromDb = asset.summary.tokenUsage as TokenUsage;
        summaryDto = {
          summary: asset.summary.summaryJson as unknown as Record<string, SummaryPointDto[]>,
          usage: {
            promptTokens: usageFromDb?.promptTokens ?? 0,
            completionTokens: usageFromDb?.completionTokens ?? 0,
            totalTokens: usageFromDb?.totalTokens ?? 0,
          },
        };
      } else {
        // If no summary exists, generate one
        summaryDto = await this.summarizationService.generateCitedSummary({
          segments: asset.structuredTranscription as unknown as SegmentDto[],
          template: templateFromType,
          locale: dto.locale,
        });

        // Save the newly generated summary to the database
        await this.prisma.assetSummary.upsert({
          where: { assetId: asset.id },
          create: {
            assetId: asset.id,
            summaryJson: summaryDto.summary as unknown as Prisma.JsonObject,
            modelUsed: 'gpt-4o-mini',
            templateUsed: meetingNote.type,
            tokenUsage: summaryDto.usage as unknown as Prisma.JsonObject,
          },
          update: {
            summaryJson: summaryDto.summary as unknown as Prisma.JsonObject,
            modelUsed: 'gpt-4o-mini',
            templateUsed: meetingNote.type,
            tokenUsage: summaryDto.usage as unknown as Prisma.JsonObject,
          },
        });
      }
      individualSummaries.push(summaryDto);
    }

    let finalSummary: SummaryWithCitationsDto;

    if (individualSummaries.length === 1 && individualSummaries[0]) {
      finalSummary = individualSummaries[0];
    } else {
      finalSummary = await this.summarizationService.combineSummaries(
        individualSummaries,
        dto.locale,
        templateFromType,
      );
    }

    const tipTapJson = convertSummaryToTiptap(finalSummary, dto.locale);

    await this.prisma.meetingNote.update({
      where: { id: noteId },
      data: {
        globalSummaryJson: finalSummary.summary as unknown as Prisma.JsonObject,
        additionalBlocksAfter: tipTapJson,
        interactionStatus: MeetingInteractionStatus.AI_GENERATED,
      },
    });

    await this.cacheManager.set(cacheKey, true, 86400);

    return this.getMeetingNoteById(noteId, user);
  }

  async uploadTranscription(
    assetId: string,
    dto: UploadTranscriptionDto,
    user: UserPayloadInterface,
  ) {
    const assetWithNote: AssetWithNotesPayload | null = await this.prisma.meetingAsset.findUnique({
      where: { id: assetId },
      include: {
        meetingNotes: {
          select: { meetingNoteId: true },
          take: 1,
        },
      },
    });

    const associatedNoteLink = assetWithNote?.meetingNotes[0];
    if (!associatedNoteLink) {
      throw new NotFoundException('Asset not found or not associated with any meeting note.');
    }
    const noteId = associatedNoteLink.meetingNoteId;
    await this.authorizeNoteAccess(noteId, user.userId);

    const transformedSegments = dto.segments.map((segment) => ({
      start_ms: segment.start_ms,
      end_ms: segment.end_ms,
      text: segment.text,
      ...(segment.confidence !== undefined && { confidence: segment.confidence }),
    }));

    await this.prisma.meetingAsset.update({
      where: { id: assetId },
      data: {
        structuredTranscription: transformedSegments,
        status: AssetStatus.COMPLETED,
      },
    });

    return { success: true };
  }

  streamSummary(
    noteId: string,
    dto: GenerateSummaryDto,
    user: UserPayloadInterface,
  ): Observable<MessageEvent> {
    const eventStream = async function* (this: MeetingNotesService) {
      await this.authorizeNoteAccess(noteId, user.userId);
      const meetingNote = await this.prisma.meetingNote.findUnique({
        where: { id: noteId },
        include: summaryFindUniquePopulate,
      });
      if (!meetingNote) {
        throw new NotFoundException('Meeting note not found.');
      }
      const validAssets = meetingNote.assets
        .map((link) => link.meetingAsset)
        .filter(
          (asset) =>
            asset &&
            Array.isArray(asset.structuredTranscription) &&
            asset.structuredTranscription.length > 0,
        );
      if (validAssets.length === 0) {
        throw new BadRequestException(
          errorMessages.BadRequestException.NO_ASSETS_WITH_VALID_TRANSCRIPTION(),
        );
      }
      const templateFromType = mapMeetingTypeToTemplateEnum(meetingNote.type);

      const individualSummaries: SummaryWithCitationsDto[] = [];
      await Promise.all(
        validAssets.map(async (asset) => {
          let summaryDto: SummaryWithCitationsDto;
          if (asset.summary && asset.summary.templateUsed === meetingNote.type) {
            const usageFromDb = asset.summary.tokenUsage as TokenUsage;
            summaryDto = {
              summary: asset.summary.summaryJson as unknown as Record<string, SummaryPointDto[]>,
              usage: {
                promptTokens: usageFromDb?.promptTokens ?? 0,
                completionTokens: usageFromDb?.completionTokens ?? 0,
                totalTokens: usageFromDb?.totalTokens ?? 0,
              },
            };
          } else {
            summaryDto = await this.summarizationService.generateCitedSummary({
              segments: asset.structuredTranscription as unknown as SegmentDto[],
              template: templateFromType,
              locale: dto.locale,
            });

            await this.prisma.assetSummary.upsert({
              where: { assetId: asset.id },
              create: {
                assetId: asset.id,
                summaryJson: summaryDto.summary as unknown as Prisma.JsonObject,
                modelUsed: 'gpt-4o-mini',
                templateUsed: meetingNote.type,
                tokenUsage: summaryDto.usage as unknown as Prisma.JsonObject,
              },
              update: {
                summaryJson: summaryDto.summary as unknown as Prisma.JsonObject,
                modelUsed: 'gpt-4o-mini',
                templateUsed: meetingNote.type,
                tokenUsage: summaryDto.usage as unknown as Prisma.JsonObject,
              },
            });
          }
          individualSummaries.push(summaryDto);
        }),
      );
      const allValidTiptapBlocks: AdditionalBlockDto[] = [];
      let finalSummary: SummaryWithCitationsDto | null = null;
      let streamHadError = false;

      let blockStreamGenerator: AsyncGenerator<AdditionalBlockDto | object>;

      if (individualSummaries.length === 1 && individualSummaries[0]) {
        finalSummary = individualSummaries[0];
        const simulatedMarkdownStream = this.convertJsonSummaryToMarkdownStream(
          finalSummary,
          dto.locale,
        );
        blockStreamGenerator = this.parseMarkdownStreamToTiptap(
          simulatedMarkdownStream as unknown as AsyncGenerator<string>,
          dto.locale,
        );
      } else {
        const realMarkdownStream = this.summarizationService.streamCombinedSummaries(
          individualSummaries,
          dto.locale,
          templateFromType,
        );
        blockStreamGenerator = this.parseMarkdownStreamToTiptap(realMarkdownStream, dto.locale);
      }

      try {
        for await (const blockOrError of blockStreamGenerator) {
          if (
            blockOrError &&
            'type' in blockOrError &&
            validTipTapBlockType.includes(blockOrError.type)
          ) {
            allValidTiptapBlocks.push(blockOrError);
            yield blockOrError;
          } else {
            streamHadError = true;
            yield blockOrError;
            break;
          }
        }
      } catch (streamError) {
        console.log(`[STREAM-SVC] Unhandled error during block stream iteration:`, streamError);
        streamHadError = true;
        yield { type: 'error', message: 'An internal error occurred during summary generation.' };
      }

      if (!streamHadError) {
        try {
          const globalSummaryJson =
            individualSummaries.length === 1 && finalSummary
              ? (finalSummary.summary as unknown as Prisma.JsonObject)
              : Prisma.JsonNull;

          await this.prisma.meetingNote.update({
            where: { id: noteId },
            data: {
              globalSummaryJson,
              additionalBlocksAfter: JSON.parse(
                JSON.stringify(allValidTiptapBlocks),
              ) as unknown as AdditionalBlockDto[],
              interactionStatus: MeetingInteractionStatus.AI_GENERATED,
            },
          });
        } catch (error) {
          console.log(`[STREAM-SVC] Failed to save summary to DB:`, error);
        }
      } else {
        console.log(
          `[STREAM-SVC] Stream encountered errors. Skipping database save for note ${noteId}.`,
        );
      }
    }.bind(this);

    return from(eventStream()).pipe(
      map((blockOrError) => {
        return { data: JSON.stringify(blockOrError) } as MessageEvent;
      }),
    );
  }

  async deleteAsset(assetId: string, user: UserPayloadInterface) {
    const asset = await this.prisma.meetingAsset.findUnique({
      where: {
        id: assetId,
      },
      include: {
        meetingNotes: {
          select: {
            meetingNote: {
              select: {
                authorId: true,
                companyId: true,
              },
            },
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found.');
    }

    const associatedNote = asset.meetingNotes.find(
      (noteLink) => noteLink.meetingNote.companyId === user.companyId,
    );

    if (!associatedNote) {
      throw new ForbiddenException(errorMessages.BadRequestException.DONT_HAVE_ACCESS());
    }

    const isAuthor = associatedNote.meetingNote.authorId === user.userId;

    let isOwnerOrManager = false;
    if (!isAuthor) {
      const requesterUserCompany =
        await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
          user.userId,
          user.companyId,
        );
      const requesterRole = requesterUserCompany?.role;
      if (requesterRole === Roles.OWNER || requesterRole === Roles.COMPANY_MANAGER) {
        isOwnerOrManager = true;
      }
    }

    if (!isAuthor && !isOwnerOrManager) {
      throw new ForbiddenException('Access denied.');
    }

    const s3Key = asset.storageKey;

    await this.prisma.meetingAsset.delete({
      where: { id: assetId },
    });

    try {
      await this.uploadsService.deleteFile(this.uploadsService.privateBucketName, s3Key);
    } catch (error) {
      console.error(
        `[Orphaned S3 Object]: Failed to delete S3 object ${s3Key} for deleted asset `,
        error,
      );
    }

    return { success: true };
  }

  private *convertJsonSummaryToMarkdownStream(
    summaryDto: SummaryWithCitationsDto,
    locale: LocaleEnum,
  ): Generator<string> {
    console.log('[CONVERTER-STREAM] Converting single JSON summary to Markdown stream...');
    const summaryData = summaryDto.summary;
    const sectionTitles: Record<string, string> =
      localizedSectionTitles[locale] || localizedSectionTitles.en;
    const defaultNoItemsMsg =
      localizedNoItemsMessage['en'] || 'No items reported for this section.';

    for (const key in sectionTitles) {
      if (Object.prototype.hasOwnProperty.call(summaryData, key)) {
        const title = sectionTitles[key];
        const points = summaryData[key] || [];
        yield `## ${title}\n\n`;
        if (points.length > 0) {
          for (const point of points) {
            let pointText = point.point || '';
            if (point.source_segments && point.source_segments.length > 0) {
              const ids = point.source_segments
                .filter((seg) => typeof seg?.start_ms === 'number')
                .map((seg) => seg.start_ms)
                .join(', ');
              if (ids) {
                pointText += ` [${ids}]`;
              }
            }
            yield `- ${pointText}\n\n`;
          }
        } else {
          const noItemsMsg = localizedNoItemsMessage[locale] || defaultNoItemsMsg;
          yield `- ${noItemsMsg}\n\n`;
        }
      }
    }
  }

  private async *parseMarkdownStreamToTiptap(
    stream: AsyncGenerator<string>,
    locale: LocaleEnum,
  ): AsyncGenerator<AdditionalBlockDto> {
    const sectionTitlesByLocale: Record<string, string> =
      localizedSectionTitles[locale] || localizedSectionTitles.en;
    const titlesToKeys: Record<string, string> = {};
    for (const key in sectionTitlesByLocale) {
      const title = sectionTitlesByLocale[key];
      if (title) {
        titlesToKeys[title] = key;
      }
    }

    let buffer = '';
    for await (const chunk of stream) {
      buffer += chunk;

      while (buffer.includes('\n\n')) {
        const parts = buffer.split('\n\n', 2);
        const blockString = parts[0];
        buffer = parts[1] || '';

        if (!blockString) continue;

        const trimmedBlock = blockString.trim();
        if (!trimmedBlock) continue;

        const tiptapBlock = convertMarkdownBlockToTiptap(trimmedBlock, titlesToKeys);
        if (tiptapBlock) {
          yield tiptapBlock;
        }
      }
    }

    if (buffer.trim()) {
      const tiptapBlock = convertMarkdownBlockToTiptap(buffer.trim(), titlesToKeys);
      if (tiptapBlock) {
        yield tiptapBlock;
      }
    }
  }

  private async authorizeNoteAccess(noteId: string, userId: string): Promise<void> {
    const note = await this.prisma.meetingNote.findFirst({
      where: {
        id: noteId,
        OR: [
          { authorId: userId },
          { participantsInSystem: { some: { user: { userId } } } },
          { shares: { some: { userId } } },
        ],
      },
    });
    if (!note) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.USER_NOT_ALLOWED_MEETING_NOTE(),
      );
    }
  }

  private getAssetTypeFromFileType(fileType: string): AssetType {
    if (fileType.startsWith('video/')) return 'VIDEO';
    if (fileType.startsWith('audio/')) return 'AUDIO';
    return 'DOCUMENT';
  }

  private buildScopeFilter(userId: string, scope: MeetingNoteScope): Prisma.MeetingNoteWhereInput {
    const scopeFilters: Record<MeetingNoteScope, Prisma.MeetingNoteWhereInput> = {
      [MeetingNoteScope.ALL_SPACE_NOTES]: {},
      [MeetingNoteScope.AUTHOR]: {
        authorId: userId,
        participantsInSystem: { none: { userId } },
      },
      [MeetingNoteScope.PARTICIPANT]: {
        participantsInSystem: {
          some: {
            user: { userId: userId },
          },
        },
        authorId: { not: userId },
      },
      [MeetingNoteScope.SHARED]: {
        shares: { some: { userId } },
        authorId: { not: userId },
        participantsInSystem: { none: { user: { userId: userId } } },
      },
      [MeetingNoteScope.MY_NOTES]: {
        OR: [
          { authorId: userId },
          { participantsInSystem: { some: { user: { userId } } } },
          { shares: { none: { userId } } },
        ],
      },
    };

    return scopeFilters[scope];
  }

  private async validateAndFetchParticipants(
    participantIds: string[] | undefined,
    user: UserPayloadInterface,
  ) {
    const idSet = new Set(participantIds || []);
    idSet.add(user.userId);
    const uniqueIds = Array.from(idSet);

    const participants = await this.userCompaniesService.getUserCompaniesByUsersIdsAndCompanyId(
      uniqueIds,
      user.companyId,
    );

    if (participants.length !== uniqueIds.length) {
      const foundIds = new Set(participants.map((p) => p.userId));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND(missingIds));
    }

    return participants;
  }

  private async validateSharedUsers(userIds: string[], companyId: string): Promise<string[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const uniqueIds = [...new Set(userIds)];

    const usersInCompany = await this.userCompaniesService.getUserCompaniesByUsersIdsAndCompanyId(
      uniqueIds,
      companyId,
    );

    if (usersInCompany.length !== uniqueIds.length) {
      const foundIds = new Set(usersInCompany.map((p) => p.userId));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND(missingIds));
    }

    return uniqueIds;
  }

  private buildMeetingNoteResponse(meetingNote: MeetingNoteWithDetails): MeetingNoteResponseDto {
    const authorRole = meetingNote.author.userCompanies[0]?.role;

    const formattedAuthor = {
      id: meetingNote.author.id,
      firstName: meetingNote.author.firstName,
      lastName: meetingNote.author.lastName,
      email: meetingNote.author.email,
      role: authorRole as Roles,
      avatar: meetingNote.author.avatar,
    };

    const formattedAssets = meetingNote.assets.map((link) => ({
      id: link.meetingAsset.id,
      type: link.meetingAsset.type,
      status: link.meetingAsset.status,
      fileName: link.meetingAsset.fileName,
      fileType: link.meetingAsset.fileType,
      fileSize: link.meetingAsset.fileSize,
      createdAt: link.meetingAsset.createdAt,
      updatedAt: link.meetingAsset.updatedAt,
      hasTranscription: !!link.meetingAsset.transcription,
    }));

    const formattedParticipantsInSystem = meetingNote.participantsInSystem.map((p) => ({
      id: p.user.user.id,
      status: p.status,
      firstName: p.user.user.firstName,
      lastName: p.user.user.lastName,
      email: p.user.user.email,
      avatar: p.user.user.avatar,
    }));

    const formattedSharedWith = meetingNote.shares.map((s) => ({
      id: s.user.id,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      avatar: s.user.avatar,
    }));

    const formattedLabels = meetingNote.labels.map((l) => ({
      id: l.label.id,
      name: l.label.name,
    }));

    return {
      ...meetingNote,
      author: formattedAuthor,
      participantsInSystem: formattedParticipantsInSystem,
      additionalBlocks: meetingNote.additionalBlocks as unknown as AdditionalBlockDto[],
      additionalBlocksAfter: meetingNote.additionalBlocksAfter as unknown as AdditionalBlockDto[],
      assets: formattedAssets,
      shares: formattedSharedWith,
      labels: formattedLabels,
      recurringMeeting: (meetingNote.recurringMeeting as unknown as GetRecurringMeetingDto) ?? null,
    };
  }
}
