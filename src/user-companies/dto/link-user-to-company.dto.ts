import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { RolesEnum } from '@src/users/enums/roles.enum';

export class LinkUserToCompanyDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsUUID()
  companyId!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(RolesEnum)
  role!: RolesEnum;
}
