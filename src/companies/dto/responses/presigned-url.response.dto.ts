import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'The temporary, signed URL for the direct S3 upload (PUT request).',
    example: 'https://argus-development-uploads.s3.eu-north-1.amazonaws.com/...',
  })
  presignedUrl!: string;

  @ApiProperty({
    description: 'The unique filename to be sent back for confirmation.',
    example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4-my-avatar.png',
  })
  uniqueFileName!: string;
}
