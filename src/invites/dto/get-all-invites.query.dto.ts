import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { BaseQueryDto } from '@src/common/dto/base.query.dto';
import { RolesEnum } from '@src/users/enums/roles.enum';

import { InviteStatusesEnum } from '../enums/invite-statuses.enum';

export class GetAllInvitesQueryDto extends BaseQueryDto {
  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsIn([RolesEnum.OWNER, RolesEnum.COMPANY_MANAGER, RolesEnum.USER], { each: true })
  roles?: RolesEnum[];

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsIn(
    [
      InviteStatusesEnum.ACCEPTED,
      InviteStatusesEnum.REJECTED,
      InviteStatusesEnum.EXPIRED,
      InviteStatusesEnum.PENDING,
    ],
    {
      each: true,
    },
  )
  status?: InviteStatusesEnum[];

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Search term to filter invites by email.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
