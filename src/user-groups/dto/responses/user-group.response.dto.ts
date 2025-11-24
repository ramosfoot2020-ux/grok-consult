import { ApiProperty } from '@nestjs/swagger';

import { Roles } from '@prisma/client';

class UserGroupMemberResponseDto {
  @ApiProperty({ description: 'UserCompany ID' })
  id!: string;

  @ApiProperty({ description: "User's nickname in the company" })
  nickname!: string;

  @ApiProperty({ description: 'Global User ID' })
  userId!: string;

  @ApiProperty({ description: "User's email address" })
  email!: string;

  @ApiProperty({ description: "User's first name", nullable: true, type: String })
  firstName!: string | null;

  @ApiProperty({ description: "User's last name", nullable: true, type: String })
  lastName!: string | null;

  @ApiProperty({ description: "User's role in the company", enum: Roles })
  role!: Roles;

  @ApiProperty({ description: 'Timestamp when the user was added to the group' })
  createdAt!: Date;

  @ApiProperty({ description: "Creator's avatar URL", nullable: true, type: String })
  avatar!: string | null;
}

class UserGroupCreatorResponseDto {
  @ApiProperty({ description: 'UserCompany ID of the creator' })
  id!: string;

  @ApiProperty({ description: "Creator's nickname" })
  nickname!: string;

  @ApiProperty({ description: 'Global User ID of the creator' })
  userId!: string;

  @ApiProperty({ description: "Creator's email address" })
  email!: string;

  @ApiProperty({ description: "Creator's first name", nullable: true })
  firstName!: string | null;

  @ApiProperty({ description: "Creator's last name", nullable: true })
  lastName!: string | null;

  @ApiProperty({ description: "Creator's role in the company", enum: Roles })
  role!: Roles;

  @ApiProperty({ description: "Creator's avatar URL", nullable: true, type: String })
  avatar!: string | null;
}

export class UserGroupDetailedResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ nullable: true, type: String })
  color!: string | null;

  @ApiProperty()
  companyId!: string;

  @ApiProperty({ type: UserGroupCreatorResponseDto, nullable: true })
  createdBy!: UserGroupCreatorResponseDto | null;

  @ApiProperty({ type: [UserGroupMemberResponseDto] })
  members!: UserGroupMemberResponseDto[];
}

export class GetAllUserGroupsResponseDto {
  @ApiProperty({ type: [UserGroupDetailedResponseDto] })
  groups!: UserGroupDetailedResponseDto[];

  @ApiProperty({ description: 'Total number of groups matching the query' })
  total!: number;
}
