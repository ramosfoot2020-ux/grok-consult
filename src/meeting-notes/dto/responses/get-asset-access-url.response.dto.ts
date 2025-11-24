import { ApiProperty } from '@nestjs/swagger';

import { Prisma } from '@prisma/client';

export class GetAssetAccessUrlResponseDto {
  @ApiProperty({
    description: 'A temporary, secure URL from which the client can stream or download the file.',
    example: 'https://my-bucket.s3.amazonaws.com/path/to/file?AWSAccessKeyId=...',
  })
  presignedUrl!: string;

  @ApiProperty({
    description: 'The full plain-text transcription of the asset.',
    nullable: true,
    example: 'Hello everyone, this is the meeting transcript...',
  })
  transcription!: string | null;

  @ApiProperty({
    description: 'Structured transcription data with timestamps, speakers, etc.',
    nullable: true,
    example: [{ speaker: 'A', timestamp: '0.5s', text: 'Hello' }],
  })
  structuredTranscription!: Prisma.JsonValue | null;
}
