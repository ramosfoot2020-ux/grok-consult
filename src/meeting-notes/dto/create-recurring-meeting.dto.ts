import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsOptional } from 'class-validator';

export class CreateRecurringMeetingDto {
  @ApiProperty({ example: 'Daily Standup' })
  @IsString()
  name!: string;

  @ApiProperty({
    required: false,
    example: 'DTSTART:20251120T154400Z\nRRULE:FREQ=DAILY;UNTIL=20251127T154400Z;WKST=MO',
  })
  @IsOptional()
  rruleData?: string;
}
