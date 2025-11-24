import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsEmail, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';

import { RolesEnum } from '@src/users/enums/roles.enum';

import { InviteTypesEnum } from '../enums/invite-types.enum';

export class CreateInviteDto {
  @ApiProperty({
    nullable: false,
  })
  @ValidateIf((dto: CreateInviteDto) => dto.inviteType === InviteTypesEnum.EMAIL)
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  @Transform(({ value }: { value: unknown }) => {
    const emailsAsArray: unknown[] = Array.isArray(value) ? value : [value];
    return emailsAsArray.map((email) =>
      typeof email === 'string' ? email.trim().toLowerCase() : email,
    );
  })
  emails!: string[];

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(RolesEnum)
  role!: RolesEnum;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(InviteTypesEnum)
  inviteType!: InviteTypesEnum;
}
