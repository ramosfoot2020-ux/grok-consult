import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DeleteRecurringMeetingDto {
  @ApiPropertyOptional({ description: 'Filter period start (inclusive)' })
  @IsOptional()
  @IsDateString()
  startDatePeriod?: Date;

  @ApiPropertyOptional({ description: 'Filter period end (inclusive)' })
  @IsOptional()
  @IsDateString()
  endDatePeriod?: Date;
}
