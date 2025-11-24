import { ApiProperty } from '@nestjs/swagger';

import {
  MeetingInteractionStatus,
  MeetingTypes,
  Roles,
  AttendanceStatus,
  AssetType,
  AssetStatus,
  MeetingArea,
} from '@prisma/client';
import { IsUUID } from 'class-validator';

import { AdditionalBlockDto } from '@src/meeting-notes/dto/additional-block.dto';
import { LabelListResponseDto } from '@src/labels/dto/responses/find-all-label.response.dto';
import { GetRecurringMeetingDto } from '@src/meeting-notes/dto/get-recurring-meeting.dto';

// A nested DTO for the author's details
export class AuthorDto {
  @ApiProperty({
    description: "The author's unique identifier.",
    example: 'd0b3b3f7-5b1f-4b9f-8c1e-3b3b3b3b3b3b',
  })
  id!: string;

  @ApiProperty({
    description: "The author's first name.",
    example: 'Jane',
  })
  firstName!: string;

  @ApiProperty({
    description: "The author's last name.",
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: "The author's email address.",
    example: 'jane.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: "The user's role in the company.",
    enum: Roles,
    example: Roles.OWNER,
  })
  role!: Roles;
}

export class MeetingAssetDto {
  @ApiProperty({ description: "The asset's unique identifier." })
  id!: string;

  @ApiProperty({ enum: AssetType, description: 'The type of the asset.' })
  type!: AssetType;

  @ApiProperty({ enum: AssetStatus, description: 'The current processing status of the asset.' })
  status!: AssetStatus;

  @ApiProperty({ description: 'The original name of the asset file.' })
  fileName!: string;

  @ApiProperty({ description: 'The MIME type of the file.' })
  fileType!: string;

  @ApiProperty({ description: 'The size of the file in bytes.' })
  fileSize!: number;

  @ApiProperty({ description: 'Indicates if a transcription is available for this asset.' })
  hasTranscription!: boolean;

  @ApiProperty({ description: 'The timestamp when the asset was created.' })
  createdAt!: Date;
}

export class SharedUserDto {
  @ApiProperty({ description: "The user's unique identifier." })
  id!: string;

  @ApiProperty({ description: "The user's first name." })
  firstName!: string;

  @ApiProperty({ description: "The user's last name." })
  lastName!: string;

  @ApiProperty({ description: "The user's email address." })
  email!: string;

  @ApiProperty({ description: "The user's avatar URL.", nullable: true, type: String })
  avatar?: string | null;
}

// A nested DTO for participants from within the system
export class ParticipantInSystemDto {
  @IsUUID('4')
  @ApiProperty({
    description: 'The unique identifier of the user record.',
    example: 'c1b2a3d4-e5f6-a8b9-1234-cba987654321',
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
    description: "The user's avatar URL.",
    example: 'https://example.com/avatar.jpg',
    nullable: true,
    type: String,
  })
  avatar?: string | null;

  @ApiProperty({ description: "The participant's attendance status.", enum: AttendanceStatus })
  status!: AttendanceStatus;
}

export class ExternalParticipantDto {
  @ApiProperty({ description: "The participant's unique identifier." })
  id!: string;

  @ApiProperty({ description: "The participant's email address." })
  email!: string;

  @ApiProperty({ description: "The participant's attendance status.", enum: AttendanceStatus })
  status!: AttendanceStatus;
}

export class MeetingNoteResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the meeting note.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

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
    description: 'The duration of the meeting in minutes.',
    example: 60,
  })
  duration!: number;

  @ApiProperty({
    description: 'The name or title of the meeting.',
    example: 'Q3 Project Kickoff',
  })
  name!: string;

  @ApiProperty({
    description: 'The physical or virtual location of the meeting.',
    example: 'Conference Room 4B',
    nullable: true,
    type: String,
  })
  location!: string | null;

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
    description: 'The type or category of the meeting.',
    enum: MeetingTypes,
    example: MeetingTypes.KICKOFF,
  })
  type!: MeetingTypes;

  @ApiProperty({
    description: 'The timestamp when the note was created.',
    example: '2025-08-21T19:10:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the note was last updated.',
    example: '2025-08-21T19:10:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'The full details of the author.',
    type: () => AuthorDto,
  })
  author!: AuthorDto;

  @ApiProperty({
    description: 'Hidden status.',
  })
  isHidden!: boolean;

  @ApiProperty({
    description: 'Interaction status.',
    enum: MeetingInteractionStatus,
    example: MeetingInteractionStatus.PENDING,
  })
  interactionStatus!: MeetingInteractionStatus;

  @ApiProperty({
    description: 'A list of assets attached to the meeting note.',
    type: () => [MeetingAssetDto],
  })
  assets!: MeetingAssetDto[];

  @ApiProperty({
    description: 'A list of users this note has been shared with.',
    type: () => [SharedUserDto],
  })
  shares!: SharedUserDto[];

  @ApiProperty({
    description: 'The public slug for accessing the meeting note.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
    type: String,
  })
  publicSlug!: string | null;

  @ApiProperty({
    description: 'The date until which the meeting note is publicly accessible.',
    example: '2025-08-21T19:10:00.000Z',
    type: String, // explicitly mark as string (ISO date)
    format: 'date-time', // OpenAPI will emit correct type
    nullable: true, // allow null
  })
  publicUntil!: Date | null;

  @ApiProperty({
    description: 'The area the meeting is associated with.',
    enum: MeetingArea,
    example: MeetingArea.SOFTWARE_DEVELOPMENT,
  })
  area!: MeetingArea | null;

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
