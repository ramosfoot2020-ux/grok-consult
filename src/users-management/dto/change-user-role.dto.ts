import { ApiProperty } from '@nestjs/swagger';

import { IsIn, IsNotEmpty } from 'class-validator';

import { RolesEnum } from '@src/users/enums/roles.enum';

export class ChangeUserRoleDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsIn([RolesEnum.OWNER, RolesEnum.USER, RolesEnum.COMPANY_MANAGER])
  role!: RolesEnum;
}
