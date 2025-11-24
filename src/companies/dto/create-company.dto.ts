import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  name!: string;
}
