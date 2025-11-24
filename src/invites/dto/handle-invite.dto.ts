import { ApiProperty, PickType } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';

import { RegisterDto } from '@src/auth/dto/register.dto';

import { InviteTypesEnum } from '../enums/invite-types.enum';

export class HandleInviteDto extends PickType(RegisterDto, [
  'password',
  'firstName',
  'lastName',
  'email',
] as const) {
  @ApiProperty({
    nullable: false,
  })
  @ValidateIf((dto: HandleInviteDto) => dto.inviteType === InviteTypesEnum.EMAIL)
  @IsNotEmpty()
  @IsUUID()
  inviteId!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(InviteTypesEnum)
  inviteType!: InviteTypesEnum;

  @ApiProperty({
    nullable: false,
  })
  @ValidateIf((dto: HandleInviteDto) => dto.inviteType === InviteTypesEnum.LINK)
  @IsNotEmpty()
  @IsString()
  token!: string;
}

export class HandleInviteExistDto {
  @ApiProperty({
    nullable: false,
  })
  @ValidateIf((dto: HandleInviteExistDto) => dto.inviteType === InviteTypesEnum.EMAIL)
  @IsNotEmpty()
  @IsUUID()
  inviteId!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(InviteTypesEnum)
  inviteType!: InviteTypesEnum;
}
