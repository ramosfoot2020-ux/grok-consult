import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateLabelDto {
  @ApiProperty({
    description: 'The new name of the label',
    example: 'Backend Task',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name?: string;
}
