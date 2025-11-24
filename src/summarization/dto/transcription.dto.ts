import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { LocaleEnum } from '@src/common/enums/locale.enum';
import { TemplateEnum } from '@src/summarization/enums/template.enum';

export class SegmentDto {
  @ApiProperty({ description: 'Start time of the segment in milliseconds.', example: 119000 })
  @IsNumber()
  start_ms!: number;

  @ApiProperty({ description: 'End time of the segment in milliseconds.', example: 124700 })
  @IsNumber()
  end_ms!: number;

  @ApiProperty({ description: 'The transcribed text of the segment.', example: 'Hello world.' })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiProperty({
    description: 'The confidence score of the transcription.',
    example: 0.65,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  confidence?: number;
}

export class TranscriptionDto {
  @ApiProperty({
    description: 'An array of transcription segments.',
    type: [SegmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentDto)
  segments!: SegmentDto[];

  @ApiProperty({
    description: "The summarization template to use. Defaults to 'default'.",
    example: TemplateEnum.DAILY,
    enum: TemplateEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(TemplateEnum)
  template?: TemplateEnum;

  @ApiProperty({
    description: "The desired language for the summary. Defaults to English ('en').",
    example: 'ua',
    enum: LocaleEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(LocaleEnum)
  locale!: LocaleEnum;
}
