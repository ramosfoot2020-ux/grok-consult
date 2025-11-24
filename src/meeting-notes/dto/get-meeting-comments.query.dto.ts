import { ApiPropertyOptional } from '@nestjs/swagger';
import { TypeMeetingPage } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class GetMeetingCommentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter comments by type (before/after)',
    enum: TypeMeetingPage,
  })
  @IsOptional()
  @IsEnum(TypeMeetingPage)
  type?: TypeMeetingPage;
}
