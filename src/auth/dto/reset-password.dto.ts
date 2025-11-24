import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { SendOtpDto } from './send-otp.dto';

export class ResetPasswordDto extends SendOtpDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  otp!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
  password!: string;
}
