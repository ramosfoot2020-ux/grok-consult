import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUploadResponseDto {
  @ApiProperty({
    description: 'Indicates if the upload confirmation and database update were successful.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: "The new, final URL of the company's avatar.",
    example:
      'https://argus-development-uploads.s3.eu-north-1.amazonaws.com/company-avatars/.../avatar.png',
  })
  avatar!: string;
}
