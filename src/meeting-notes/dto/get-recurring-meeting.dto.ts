import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString, IsUUID } from 'class-validator';
// import { RecurrenceFrequency } from '@prisma/client';
// export enum RecurrenceFrequency {
//   DAILY = 'DAILY',
//   WEEKLY = 'WEEKLY',
//   MONTHLY = 'MONTHLY',
// }
export class GetRecurringMeetingDto {
  @ApiProperty({
    description: 'The unique identifier of the recurring meetings.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

  @ApiProperty({ example: 'Daily Standup' })
  @IsString()
  name!: string;

  @ApiProperty({
    required: false,
    example: 'DTSTART:20251120T154400Z\nRRULE:FREQ=DAILY;UNTIL=20251127T154400Z;WKST=MO',
  })
  @IsOptional()
  rruleData?: string | null;

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

  @ApiProperty({ description: 'The timestamp when the asset was created.' })
  createdAt!: Date;
}
