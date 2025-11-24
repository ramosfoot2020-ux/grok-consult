import { ApiProperty } from '@nestjs/swagger';

export class GenerateAssetUploadUrlResponseDto {
  @ApiProperty({
    description: 'A temporary, secure URL to which the client should upload the file.',
    example: 'https://my-bucket.s3.amazonaws.com/path/to/file?AWSAccessKeyId=...',
  })
  presignedUrl!: string;

  @ApiProperty({
    description: 'The unique identifier of the newly created asset record.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  assetId!: string;
}
