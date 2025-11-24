import { ApiProperty } from '@nestjs/swagger';

import { InviteTypes, Roles } from '@prisma/client';

export class InviteDto {
  @ApiProperty({
    description: 'The unique identifier of the invite.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'The email address the invite was sent to.',
    example: 'new.user@example.com',
    nullable: true,
    type: String,
  })
  email!: string | null;

  @ApiProperty({
    description: 'The role assigned to the user upon accepting the invite.',
    enum: Roles,
    example: Roles.USER,
  })
  role!: Roles;

  @ApiProperty({ description: 'The ID of the company the invite belongs to.' })
  companyId!: string;

  @ApiProperty({
    description: 'The unique part of the invite link.',
    example: 'link-a1b2c3d4e5f6',
    nullable: true,
  })
  link!: string | null;

  @ApiProperty({ description: 'The timestamp when the invite expires.' })
  validUntil!: Date;

  @ApiProperty({
    description: 'The type of the invite (email or link).',
    enum: InviteTypes,
    example: InviteTypes.email,
  })
  type!: InviteTypes;

  @ApiProperty({
    description: 'The timestamp when the invite was rejected.',
    nullable: true,
  })
  rejectedAt!: Date | null;

  @ApiProperty({
    description: 'The timestamp when the invite was accepted.',
    nullable: true,
  })
  acceptedAt!: Date | null;

  @ApiProperty({ description: 'The timestamp when the invite was created.' })
  createdAt!: Date;

  @ApiProperty({ description: 'The timestamp when the invite was last updated.' })
  updatedAt!: Date;
}
