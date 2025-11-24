import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({
    description: 'The name of the label',
    example: 'Frontend',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name!: string;
}
