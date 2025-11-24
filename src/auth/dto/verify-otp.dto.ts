import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { IsNormalizedEmail } from '@src/common/utils/decorators/is-normalized-email.decorator';

export class VerifyOtpDto {
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
  otp!: string;
}
