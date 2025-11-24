import { ApiProperty } from '@nestjs/swagger';

import { Roles } from '@prisma/client';

export class CompanyUserResponseDto {
  @ApiProperty({ description: "The user's unique identifier (User ID)." })
  id!: string;

  @ApiProperty({ description: "The user's first name." })
  firstName!: string;

  @ApiProperty({ description: "The user's last name." })
  lastName!: string;

  @ApiProperty({ description: "The user's email address." })
  email!: string;

  @ApiProperty({ description: "The user's role within the company.", enum: Roles })
  role!: Roles;

  @ApiProperty({ description: "The user's avatar URL.", nullable: true, type: String })
  avatar?: string | null;

  @ApiProperty({ description: 'The date the user joined the company.' })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date the user was removed from the company.',
    nullable: true,
    type: Date,
  })
  removedAt?: Date | null;

  @ApiProperty({
    description: 'The date the user was blocked in the company.',
    nullable: true,
    type: Date,
  })
  blockedAt?: Date | null;

  @ApiProperty({
    description: "The user's nickname within the company.",
    nullable: true,
    type: String,
  })
  nickname?: string | null;
}

export class GetAllCompanyUsersResponseDto {
  @ApiProperty({ type: () => [CompanyUserResponseDto] })
  users!: CompanyUserResponseDto[];

  @ApiProperty({ description: 'Total number of users matching the filter.' })
  total!: number;
}
