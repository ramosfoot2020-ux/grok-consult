import { ApiProperty } from '@nestjs/swagger';

export class TogglePublicSharingResponseDtoDto {
  @ApiProperty({
    description: 'The public URL for accessing the shared meeting note.',
    example: 'https://yourdomain.com/public-notes/unique-slug/after',
    type: String,
    nullable: true,
  })
  publicUrl!: string | null;
}
