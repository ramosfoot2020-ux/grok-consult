import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { TypeMeetingPage } from '@prisma/client';

export class UpdateCommentDto {
  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  from?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  to?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  editorDataCommentId?: string;

  @ApiProperty({ enum: TypeMeetingPage, example: 'before' })
  @IsEnum(TypeMeetingPage)
  type!: TypeMeetingPage;

  @ApiProperty({
    description: '',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  resolved: boolean = false;
}
