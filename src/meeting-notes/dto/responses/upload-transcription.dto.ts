import { ApiProperty } from '@nestjs/swagger';

import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { SegmentDto } from '@src/summarization/dto/transcription.dto';

export class UploadTranscriptionDto {
  @ApiProperty({
    description: 'An array of transcription segments.',
    type: [SegmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentDto)
  segments!: SegmentDto[];
}
