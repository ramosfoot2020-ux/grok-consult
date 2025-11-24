import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmAvatarUploadDto {
  @ApiProperty({
    description: 'The unique filename returned from the first API call',
    example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-my-avatar.png',
  })
  @IsString()
  @IsNotEmpty()
  uniqueFileName!: string;
}
