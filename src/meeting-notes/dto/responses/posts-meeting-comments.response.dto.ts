import { ApiProperty } from '@nestjs/swagger';
import { TypeMeetingPage } from '@prisma/client';
export class CommentAuthorInfoDto {
  @ApiProperty({
    description: 'Unique identifier of author.',
    example: '80ed03ce-790e-4744-adc2-0bd7af6867a7',
  })
  id!: string;

  @ApiProperty({
    description: "Author's first name.",
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: "Author's last name.",
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: "The user's avatar URL.",
    example: 'https://example.com/avatars/john.jpg',
    nullable: true,
    required: false,
    type: String,
  })
  avatar?: string | null;
}

export class MeetingCommentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the comment.',
    example: 'ebc663d6-abaa-4cff-9ae1-8699aaf34c2e',
  })
  id!: string;

  @ApiProperty({
    description: 'Text content of the comment.',
    example: 'string',
  })
  content!: string;

  @ApiProperty({
    description: 'Timestamp when the comment was created.',
    example: '2025-11-11T12:53:54.088Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the comment was last updated.',
    example: '2025-11-11T12:53:54.088Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'ID of the meeting note this comment belongs to.',
    example: 'a25a69bf-c4f1-46a6-a90c-269b4300ef48',
  })
  meetingNoteId!: string;

  @ApiProperty({
    description: 'ID of the user who created the comment.',
    example: 'b3baed50-3b4a-4de3-8fed-b1f76bb73c12',
  })
  authorId!: string;

  @ApiProperty({
    description: 'ID of the parent comment if this is a reply. `null` for root comments.',
    example: null,
    nullable: true,
  })
  parentId?: string | null;

  @ApiProperty({
    description: 'Whether the comment is marked as resolved.',
    example: false,
  })
  resolved!: boolean;

  @ApiProperty({
    description: 'Param for editor',
    example: 23,
    nullable: true,
    type: Number,
  })
  from!: number | null;

  @ApiProperty({
    description: 'Param for editor',
    example: 34,
    nullable: true,
    type: Number,
  })
  to!: number | null;

  @ApiProperty({
    description: 'Param for editor',
    example: 'b3baed50-3b4a-4de3-8fed-b1f76bb73c12',
    nullable: true,
    type: String,
  })
  editorDataCommentId!: string | null;

  @ApiProperty({
    description: 'Param for ceparate before or after meeting',
    example: 'before',
  })
  type!: TypeMeetingPage;

  @ApiProperty({
    description: 'Information about the author of the comment.',
    type: () => CommentAuthorInfoDto,
  })
  author!: CommentAuthorInfoDto;
}
