import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class GenerateAssetUploadUrlDto {
  @ApiProperty({
    description: 'The name of the file being uploaded.',
    example: 'meeting-video.mp4',
  })
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @ApiProperty({ description: 'The MIME type of the file.', example: 'video/mp4' })
  @IsNotEmpty()
  @IsString()
  fileType!: string;

  @ApiProperty({ description: 'The size of the file in bytes.', example: 10485760 })
  @IsNotEmpty()
  @IsInt()
  fileSize!: number;
}
