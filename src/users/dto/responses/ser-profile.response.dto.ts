// src/users/dto/responses/user-profile.response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

// CHANGE 1: Import the enum from Prisma instead of your custom enum file.
import { Roles } from '@prisma/client';

class CompanyMembershipDto {
  @ApiProperty({
    description: 'The unique identifier of the company',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: "The URL of the company's avatar",
    example: 'https://example.com/avatars/innovate-inc.png',
    required: false,
    nullable: true,
  })
  avatar!: string | null;

  @ApiProperty({
    description: 'The name of the company',
    example: 'Innovate Inc.',
  })
  name!: string;

  @ApiProperty({
    description: "The user's role within this company",
    enum: Roles,
    example: Roles.ADMIN,
  })
  role!: Roles;
}

// The main response DTO for the user profile
export class UserProfileResponseDto {
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
    example: true,
  })
  emailConfirmed!: boolean | null;

  @ApiProperty({
    description: 'Indicates if the user has opted in for feature updates',
    example: false,
  })
  featureUpdates!: boolean | null;

  @ApiProperty({
    description: 'Indicates if the user is required to reset their password',
    example: false,
  })
  passwordResetRequired!: boolean | null;

  @ApiProperty({
    description: 'The timestamp when the user was created',
    example: '2025-07-22T14:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the user was last updated',
    example: '2025-07-22T16:45:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'The timestamp when the user was blocked, if applicable',
    example: null,
    nullable: true,
  })
  blockedAt!: Date | null;

  @ApiProperty({
    description: 'The timestamp when the user was deleted, if applicable',
    example: null,
    nullable: true,
  })
  deletedAt!: Date | null;

  @ApiProperty({
    description: 'The ID of the user`s main company',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  mainCompanyId!: string;

  @ApiProperty({
    description: 'The currently selected company and the user role within it',
    type: () => CompanyMembershipDto,
  })
  currentCompany!: CompanyMembershipDto;

  @ApiProperty({
    description: 'List of all companies the user is a member of',
    type: () => [CompanyMembershipDto],
  })
  userCompanies!: CompanyMembershipDto[];

  @ApiProperty({
    description: 'The URL of the user`s avatar image',
    example: 'https://example.com/avatars/jane-doe.png',
    type: String,
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({
    description: 'The user`s time zone in IANA format',
    example: 'America/New_York',
    type: String,
    nullable: true,
  })
  timeZone?: string | null;
}
