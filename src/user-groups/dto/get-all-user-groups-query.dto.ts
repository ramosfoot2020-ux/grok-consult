import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { BaseQueryDto } from '@src/common/dto/base.query.dto';

export class GetAllUserGroupsQueryDto extends BaseQueryDto {
  @ApiProperty({
    description: 'Search string to filter groups by name',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
