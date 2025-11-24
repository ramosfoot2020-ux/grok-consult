import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Roles } from '@prisma/client';

import { BaseQueryDto } from '@src/common/dto/base.query.dto';
import { UserStatusesEnum } from '@src/users/enums/user-statuses.enum';

export class GetAllUsersQueryDto extends BaseQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  @IsIn([Roles.OWNER, Roles.COMPANY_MANAGER, Roles.USER], { each: true })
  roles?: Roles[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]).map(String);
  })
  @IsIn([UserStatusesEnum.ACTIVE, UserStatusesEnum.BLOCKED, UserStatusesEnum.DELETED], {
    each: true,
  })
  status?: UserStatusesEnum[];

  @ApiPropertyOptional({
    description: 'Search term to filter users by first name, last name, or email.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
