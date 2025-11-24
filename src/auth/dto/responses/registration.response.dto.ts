import { ApiProperty } from '@nestjs/swagger';

import { User } from '@prisma/client';

export class RegistrationResponseDto implements Partial<User> {
  @ApiProperty({
    description: "The user's unique identifier",
    example: 'd0b3b3f7-5b1f-4b9f-8c1e-3b3b3b3b3b3b',
  })
  id!: string;

  @ApiProperty({
    description: "The user's email address",
    example: 'jane.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: "The user's first name",
    example: 'Jane',
  })
  firstName!: string;

  @ApiProperty({
    description: "The user's last name",
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Indicates if the user has confirmed their email address',
    example: false,
    nullable: true,
  })
  emailConfirmed!: boolean | null;

  @ApiProperty({
    description: 'The timestamp when the user was created',
    example: '2025-07-22T16:30:04.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the user was last updated',
    example: '2025-07-22T16:30:04.000Z',
  })
  updatedAt!: Date;
}
