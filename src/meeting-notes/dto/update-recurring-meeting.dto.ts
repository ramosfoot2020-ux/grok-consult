import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateMeetingNoteDto } from './update-meeting-notes.dto';

export class UpdateRecurringMeetingDto {
  @ApiPropertyOptional({ description: 'Filter period start (inclusive)' })
  @IsOptional()
  @IsDateString()
  startDatePeriod?: Date;

  @ApiPropertyOptional({ description: 'Filter period end (inclusive)' })
  @IsOptional()
  @IsDateString()
  endDatePeriod?: Date;

  @ApiPropertyOptional({
    description: 'Fields to apply to all (or part) of recurring meeting notes',
    type: () => UpdateMeetingNoteDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMeetingNoteDto)
  updateData?: UpdateMeetingNoteDto;
}
