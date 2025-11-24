import { ApiProperty } from '@nestjs/swagger';

import { InviteDto } from './invite.dto';

export class GetAllInvitesResponseDto {
  @ApiProperty({
    description: 'The list of invites for the current page.',
    type: () => [InviteDto],
  })
  invites!: InviteDto[];

  @ApiProperty({
    description: 'The total number of invites matching the query.',
    example: 25,
  })
  total!: number;
}
