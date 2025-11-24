import { ApiProperty } from '@nestjs/swagger';

import {
  AssetType,
  MeetingArea,
  MeetingInteractionStatus,
  MeetingTypes,
  Roles,
} from '@prisma/client';
import { IsUUID } from 'class-validator';

import { AdditionalBlockDto } from '@src/meeting-notes/dto/additional-block.dto';
import {
  ExternalParticipantDto,
  ParticipantInSystemDto,
} from '@src/meeting-notes/dto/responses/get-meeting-note-bu-id.reponse.dto';
import { LabelListResponseDto } from '@src/labels/dto/responses/find-all-label.response.dto';
import { GetRecurringMeetingDto } from '@src/meeting-notes/dto/get-recurring-meeting.dto';

// A nested DTO for basic user details within the list
export class UserDto {
  @ApiProperty({
    description: "The user's unique identifier.",
    example: 'd0b3b3f7-5b1f-4b9f-8c1e-3b3b3b3b3b3b',
  })
  id!: string;
  @ApiProperty({
    description: "The user's first name.",
    example: 'Jane',
  })
  firstName!: string;
  @ApiProperty({
    description: "The user's last name.",
    example: 'Doe',
  })
  lastName!: string;
  @ApiProperty({
    description: "The user's email address.",
    example: 'jane.doe@example.com',
  })
  email!: string;
  @ApiProperty({
    description: "The user's role in the company.",
    enum: Roles,
    example: Roles.OWNER,
    nullable: true,
  })
  role?: Roles | null;
  @ApiProperty({
    description: "The user's avatar URL.",
    example: 'https://example.com/avatar.jpg',
    nullable: true,
    type: String,
  })
  avatar?: string | null;
}

export class MeetingAssetSummaryDto {
  @ApiProperty({ description: "The asset's unique identifier." })
  id!: string;

  @ApiProperty({ enum: AssetType, description: 'The type of the asset.' })
  type!: AssetType;

  @ApiProperty({ description: 'The original name of the asset file.' })
  fileName!: string;

  @ApiProperty({ description: 'Indicates if a transcription is available for this asset.' })
  hasTranscription!: boolean;
}

// A DTO for a single item in the paginated list
class MeetingNoteListItemDto {
  @ApiProperty({
    description: 'The unique identifier of the meeting note.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'The name or title of the meeting.',
    example: 'Q3 Project Kickoff',
  })
  name!: string;

  @ApiProperty({
    description: 'The type or category of the meeting.',
    enum: MeetingTypes,
    example: MeetingTypes.KICKOFF,
  })
  type!: MeetingTypes;

  @ApiProperty({
    description: 'The area the meeting is associated with.',
    enum: MeetingArea,
    example: MeetingArea.SOFTWARE_DEVELOPMENT,
  })
  area?: MeetingArea | null;

  @ApiProperty({
    description: 'The physical or virtual location of the meeting.',
    example: 'Conference Room 4B',
    nullable: true,
    type: String,
  })
  location!: string | null;

  @ApiProperty({
    description: 'The start date and time of the meeting.',
    example: '2025-08-22T10:00:00.000Z',
  })
  startDate!: Date;

  @ApiProperty({
    description: 'The end date and time of the meeting.',
    example: '2025-08-22T11:00:00.000Z',
  })
  endDate!: Date;

  @ApiProperty({
    description: 'A list of participants who are registered in the system.',
    type: () => [ParticipantInSystemDto],
  })
  participantsInSystem!: ParticipantInSystemDto[];

  @ApiProperty({
    description: 'A list of external participants (by email).',
    type: () => [ExternalParticipantDto],
  })
  participantsOutSystem!: ExternalParticipantDto[];

  @ApiProperty({
    description: 'Hidden status.',
  })
  isHidden!: boolean;

  @ApiProperty({
    description: 'Duration of the meeting in minutes.',
    example: 60,
  })
  duration!: number;

  @IsUUID('4')
  @ApiProperty({
    description: 'The ID of the user who created the meeting note.',
    example: 'd0b3b3f7-5b1f-4b9f-8c1e-3b3b3b3b3b3b',
  })
  authorId!: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'The ID of the company associated with the meeting note.',
    example: 'd0b3b3f7-5b1f-4b9f-8c1e-3b3b3b3b3b3b',
  })
  companyId!: string;

  @ApiProperty({
    description: 'The full details of the author.',
    type: () => UserDto,
  })
  author!: UserDto;

  @ApiProperty({
    description: 'Interaction status.',
    enum: MeetingInteractionStatus,
    example: MeetingInteractionStatus.PENDING,
  })
  interactionStatus!: MeetingInteractionStatus;

  @ApiProperty({
    description: 'Custom data blocks for Tip tap, agendas, etc.',
    type: () => [AdditionalBlockDto],
  })
  additionalBlocks!: AdditionalBlockDto[];

  @ApiProperty({
    description: 'Custom data blocks for Tip tap, agendas, etc. (After meeting)',
    type: () => [AdditionalBlockDto],
  })
  additionalBlocksAfter!: AdditionalBlockDto[];

  @ApiProperty({
    description: 'A summary list of assets attached to this meeting note.',
    type: () => [MeetingAssetSummaryDto],
  })
  assets!: MeetingAssetSummaryDto[];

  @ApiProperty({
    description: 'A list of labels attached to the meeting note.',
    type: () => [LabelListResponseDto],
  })
  labels!: LabelListResponseDto[];

  @ApiProperty({
    description: 'Recurrence settings for the meeting, if it is part of a recurring series.',
    type: () => GetRecurringMeetingDto,
    nullable: true,
  })
  recurringMeeting!: GetRecurringMeetingDto | null;
}

export class GetAllMeetingNotesResponseDto {
  @ApiProperty({
    description: 'The total number of meeting notes matching the query criteria.',
    example: 50,
  })
  total!: number;

  @ApiProperty({
    description: 'The total number of required attention meeting notes.',
    example: 50,
  })
  attentionTotal!: number;

  @ApiProperty({
    description: 'The list of meeting notes for the current page.',
    type: () => [MeetingNoteListItemDto],
  })
  meetingNotes!: MeetingNoteListItemDto[];
}
