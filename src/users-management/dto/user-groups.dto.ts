import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UserGroupsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    description: 'An optional description for the group',
    example: 'All frontend developers',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description!: string | null;

  @ApiProperty({
    description: 'An optional hex color code for the group (e.g., #FF5733)',
    example: '#FF5733',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsHexColor()
  @IsOptional()
  color!: string | null;
}
