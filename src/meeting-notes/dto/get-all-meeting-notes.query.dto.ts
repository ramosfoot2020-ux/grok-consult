import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MeetingInteractionStatus, MeetingTypes } from '@prisma/client';

import { BaseQueryDto } from '@src/common/dto/base.query.dto';
import { MeetingNoteScope } from '@src/meeting-notes/enums/meeting-notes-scope.enum';
import { IsEndDateAfterStartDate } from '@src/common/utils/validations/is-end-date-after-start-date.validator';

export class GetAllMeetingNotesQueryDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(MeetingTypes, { each: true })
  @IsArray()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  type?: MeetingTypes[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @IsEndDateAfterStartDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  @IsArray()
  @IsEmail({}, { each: true })
  participantsOutSystem?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  @IsArray()
  @IsUUID('4', { each: true })
  participantsInSystem?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter notes by their visibility status.',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isHidden: boolean = false;

  @ApiPropertyOptional({
    description: "Filter notes based on the user's involvement.",
    enum: MeetingNoteScope,
    example: MeetingNoteScope.AUTHOR,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(MeetingNoteScope)
  scope?: MeetingNoteScope;

  @ApiPropertyOptional({
    description: 'Filter notes by their interaction status.',
    enum: MeetingInteractionStatus,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(MeetingInteractionStatus, { each: true })
  @IsArray()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  interactionStatus?: MeetingInteractionStatus[];

  @ApiPropertyOptional({
    description: 'An array of label IDs to filter the meeting notes by.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  labels?: string[];
}
