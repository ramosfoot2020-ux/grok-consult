import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailInviteResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'The number of invites that were created and sent.',
    example: 5,
  })
  count!: number;
}
