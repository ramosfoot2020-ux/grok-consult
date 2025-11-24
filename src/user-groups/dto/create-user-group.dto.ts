import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserGroupDto {
  @ApiProperty({
    description: 'The name of the group',
    example: 'Frontend Team',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    description: 'An optional description for the group',
    example: 'All frontend developers',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    description: 'An optional hex color code for the group (e.g., #FF5733)',
    example: '#FF5733',
    required: false,
  })
  @IsString()
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'An optional array of UserCompany IDs to add as initial members.',
    example: ['uuid-for-user-company-1', 'uuid-for-user-company-2'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  memberIds?: string[];
}
