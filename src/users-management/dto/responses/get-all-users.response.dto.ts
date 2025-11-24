import { ApiProperty } from '@nestjs/swagger';

import { Roles } from '@prisma/client';
import { UserGroupsDto } from '@src/users-management/dto/user-groups.dto';

// A nested DTO to describe the core user information
class ManagedUserDetailsDto {
  @ApiProperty({
    description: "The user's unique identifier",
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: "The user's email address",
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({ description: "The user's first name", example: 'John' })
  firstName!: string;

  @ApiProperty({ description: "The user's last name", example: 'Doe' })
  lastName!: string;

  @ApiProperty({
    description: 'Indicates if the user has confirmed their email address',
    example: true,
    nullable: true,
  })
  emailConfirmed!: boolean | null;

  @ApiProperty({
    description: 'The timestamp when the user was created',
    example: '2025-07-22T14:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The URL of the user avatar',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
    type: String,
  })
  avatar?: string | null;
}

// A DTO for the UserCompany object with its nested user details
class UserManagementDataDto {
  @ApiProperty({
    description: 'The unique ID of the user-company relationship',
    example: 'c1b2a3d4-e5f6-a8b9-1234-cba987654321',
  })
  id!: string;

  @ApiProperty({
    description: "The user's role in the company",
    enum: Roles,
    example: Roles.USER,
  })
  role!: Roles;

  @ApiProperty({
    description: "The user's custom nickname in the company",
    example: 'Johnny',
    nullable: true,
    type: String,
  })
  nickname!: string | null;

  @ApiProperty({
    description: 'Indicates if the user has been blocked',
    example: '2025-07-22T14:30:00.000Z',
    nullable: true,
    type: Date,
  })
  blockedAt!: Date | null;

  @ApiProperty({
    description: 'Indicates if the user has been removes from the company',
    example: '2025-07-22T14:30:00.000Z',
    nullable: true,
    type: Date,
  })
  removedAt!: Date | null;

  @ApiProperty({
    description: 'The full user object',
    type: () => ManagedUserDetailsDto,
  })
  user!: ManagedUserDetailsDto;

  @ApiProperty({
    description: 'List of groups the user belongs to',
    type: () => [UserGroupsDto],
  })
  groups!: UserGroupsDto[];
}

// The main response DTO for the GET /users endpoint
export class GetAllUsersResponseDto {
  @ApiProperty({
    description: 'The list of users for the current page.',
    type: () => [UserManagementDataDto],
  })
  userCompanies!: UserManagementDataDto[];

  @ApiProperty({
    description: 'The total number of users matching the query criteria.',
    example: 42,
  })
  total!: number;
}
