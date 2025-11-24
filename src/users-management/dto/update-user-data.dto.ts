import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserData {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  nickname!: string;
}
