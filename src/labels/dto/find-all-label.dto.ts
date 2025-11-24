import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { BaseQueryDto } from '@src/common/dto/base.query.dto';

export class GetAllLabelsQueryDto extends BaseQueryDto {
  @ApiProperty({
    description: 'Search string to filter labels by name',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
