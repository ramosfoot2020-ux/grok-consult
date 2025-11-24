import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+,\-.;:'"<>/?[\]{}`~|])[\w!@#$%^&*()_+,\-.;:'"<>/?[\]{}`~|]{8,}$/,
  )
  password!: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
