import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlocksTypes, MeetingTypes, MeetingArea } from '@prisma/client';

import { IsEndDateAfterStartDate } from '@src/common/utils/validations/is-end-date-after-start-date.validator';
import { AdditionalBlockDto } from '@src/meeting-notes/dto/additional-block.dto';
import { CreateRecurringMeetingDto } from './create-recurring-meeting.dto';

export class CreateMeetingNoteDto {
  @ApiProperty({
    nullable: false,
    enum: MeetingTypes,
    example: MeetingTypes.DAILY,
  })
  @IsNotEmpty()
  @IsEnum(MeetingTypes)
  type!: MeetingTypes;

  @ApiProperty({
    enum: MeetingArea,
    example: MeetingArea.SOFTWARE_DEVELOPMENT,
  })
  @IsOptional()
  @IsEnum(MeetingArea)
  area?: MeetingArea;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsDateString()
  startDate!: Date;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsDateString()
  @IsEndDateAfterStartDate()
  endDate!: Date;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'A list of custom content blocks for the meeting note.',
    type: [AdditionalBlockDto],
    example: [
      {
        source: 'custom',
        type: BlocksTypes.AGENDA_ITEM,
        body: { text: 'Discuss the Q3 financial report.' },
      },
      {
        source: 'editor',
        type: BlocksTypes.MEETING_PREREQUISITES,
        body: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Review last meeting notes.' }] },
          ],
        },
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdditionalBlockDto)
  @IsArray()
  additionalBlocks?: AdditionalBlockDto[];

  @ApiPropertyOptional({
    description: 'A list of custom content blocks for the meeting note (After meeting).',
    type: [AdditionalBlockDto],
    example: [
      {
        source: 'custom',
        type: BlocksTypes.AGENDA_ITEM,
        body: { text: 'Discuss the Q3 financial report.' },
      },
      {
        source: 'editor',
        type: BlocksTypes.MEETING_PREREQUISITES,
        body: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Review last meeting notes.' }] },
          ],
        },
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AdditionalBlockDto)
  @IsArray()
  additionalBlocksAfter?: AdditionalBlockDto[];

  @ApiPropertyOptional()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantsInSystem?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  participantsOutSystem?: string[];

  @ApiPropertyOptional({
    description: 'An array of existing label IDs to associate with the meeting note.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  labelIds?: string[];

  @ApiPropertyOptional({
    description: 'Recurring series settings. If provided, multiple MeetingNotes will be created.',
    type: () => CreateRecurringMeetingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecurringMeetingDto)
  recurring?: CreateRecurringMeetingDto;
}
