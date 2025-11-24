import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

import { IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

import { IsNormalizedEmail } from '@src/common/utils/decorators/is-normalized-email.decorator';

import { CreateMeetingNoteDto } from './create-meeting-note.dto';

// A DTO for updating a single internal participant's status
export class UpdateParticipantInSystemDto {
  @ApiProperty({ description: 'The UserCompany ID of the participant.' })
  @IsUUID('4')
  userId!: string;

  @ApiProperty({ enum: AttendanceStatus, description: "The participant's new attendance status." })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}

// A DTO for the state of a single external participant
export class UpdateParticipantOutSystemDto {
  @ApiProperty({ description: "The external participant's email." })
  @IsNormalizedEmail()
  email!: string;

  @ApiProperty({ enum: AttendanceStatus, description: "The participant's new attendance status." })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}

const UpdateDtoBase = PartialType(
  OmitType(CreateMeetingNoteDto, [
    'participantsInSystem',
    'participantsOutSystem',
    'recurring',
  ] as const),
);

export class UpdateMeetingNoteDto extends UpdateDtoBase {
  @ApiPropertyOptional({ type: () => [UpdateParticipantInSystemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateParticipantInSystemDto)
  participantsInSystem?: UpdateParticipantInSystemDto[];

  @ApiPropertyOptional({ type: () => [UpdateParticipantOutSystemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateParticipantOutSystemDto)
  participantsOutSystem?: UpdateParticipantOutSystemDto[];

  @ApiPropertyOptional({
    description: 'A list of User IDs to share the note with. This will replace the existing list.',
    type: [String],
    example: ['uuid-of-user-1', 'uuid-of-user-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  shares?: string[];

  @ApiPropertyOptional({
    description:
      'An array of label IDs to associate with the note. This will completely replace the existing labels.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  labelIds?: string[];
}
