import { ApiProperty } from '@nestjs/swagger';

import { Company } from '@prisma/client';

export class CompanyResponseDto implements Partial<Company> {
  @ApiProperty({
    description: 'The unique identifier of the company',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'The name of the company',
    example: 'Innovate Inc.',
  })
  name!: string;

  @ApiProperty({
    description: "The URL of the company's avatar",
    example: 'https://example.com/avatars/innovate-inc.png',
    required: false,
    nullable: true,
  })
  avatar!: string | null;

  @ApiProperty({
    description: 'The timestamp when the company was created',
    example: '2025-07-22T17:05:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the company was last updated',
    example: '2025-07-22T17:05:00.000Z',
  })
  updatedAt!: Date;
}
