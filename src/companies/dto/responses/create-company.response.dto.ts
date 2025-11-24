import { ApiProperty } from '@nestjs/swagger';

import { Roles } from '@prisma/client';

import { CompanyResponseDto } from './company.response.dto';

class UserInCompanyDto {
  @ApiProperty({
    description: "The user's unique identifier",
    example: 'f0e9d8c7-b6a5-4f3e-2d1c-0b9a8f7e6d5c',
  })
  id!: string;

  @ApiProperty({
    description: "The user's first name",
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: "The user's last name",
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: "The user's email address",
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: "URL to the user's avatar image",
    example: 'https://example.com/avatars/johndoe.jpg',
    type: String,
    nullable: true,
  })
  avatar?: string | null;
}

// This nested DTO represents the link between a user and the company.
class CompanyUserDto {
  @ApiProperty({
    description: 'The unique ID of the user-company relationship',
    example: 'c1b2a3d4-e5f6-a8b9-1234-cba987654321',
  })
  id!: string;

  @ApiProperty({
    description: "The user's role within the company",
    enum: Roles,
    example: Roles.OWNER,
  })
  role!: Roles;

  @ApiProperty({
    description: 'The user associated with this company link',
    type: () => UserInCompanyDto,
  })
  user!: UserInCompanyDto;
}

// This is the main response DTO for the create company endpoint.
export class CreateCompanyResponseDto extends CompanyResponseDto {
  @ApiProperty({
    description: 'A list of users associated with the company',
    type: () => [CompanyUserDto],
  })
  users!: CompanyUserDto[];
}
