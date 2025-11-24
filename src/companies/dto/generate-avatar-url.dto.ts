import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GenerateAvatarUrlDto {
  @ApiProperty({ example: 'my-avatar.png' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^image\/(jpeg|png)$/, {
    message: 'Invalid file type. Only JPG, PNG, and GIF are allowed.',
  })
  fileType!: string;
}
