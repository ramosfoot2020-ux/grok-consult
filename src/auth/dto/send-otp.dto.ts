import { ApiProperty } from '@nestjs/swagger';

import { IsNormalizedEmail } from '@src/common/utils/decorators/is-normalized-email.decorator';

export class SendOtpDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNormalizedEmail()
  email!: string;
}
