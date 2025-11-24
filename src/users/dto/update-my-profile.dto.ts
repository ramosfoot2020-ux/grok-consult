import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const validTimeZones = Intl.supportedValuesOf('timeZone');

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ description: "The user's first name.", example: 'John' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiPropertyOptional({ description: "The user's last name.", example: 'Doe' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiPropertyOptional({
    description: "The user's IANA time zone name.",
    example: 'Europe/Kyiv',
  })
  @IsOptional()
  @IsIn(validTimeZones, {
    message: 'A valid IANA time zone name must be provided.',
  })
  timeZone?: string;
}
