import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { IsNormalizedEmail } from '@src/common/utils/decorators/is-normalized-email.decorator';

export class RegisterDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNormalizedEmail()
  email!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
  password!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName!: string;

  userIp!: string;
}
