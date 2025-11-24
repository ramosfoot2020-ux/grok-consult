import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful.',
    example: true,
  })
  success!: boolean;
}
