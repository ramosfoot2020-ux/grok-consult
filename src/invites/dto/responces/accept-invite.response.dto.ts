import { ApiProperty } from '@nestjs/swagger';

import { InviteDto } from './invite.dto';

class InvitedUserDto {
  @ApiProperty({ description: "The created or found user's ID." })
  id!: string;

  @ApiProperty({ description: "The user's email." })
  email!: string;

  @ApiProperty({ description: "The user's first name." })
  firstName!: string;

  @ApiProperty({ description: "The user's last name." })
  lastName!: string;
}

export class AcceptInviteResponseDto {
  @ApiProperty({
    description: 'The user who accepted the invite.',
    type: () => InvitedUserDto,
  })
  invitedUser!: InvitedUserDto;

  @ApiProperty({
    description: 'The invite record, updated with the acceptance timestamp.',
    type: () => InviteDto,
  })
  updatedInvite!: InviteDto;
}
