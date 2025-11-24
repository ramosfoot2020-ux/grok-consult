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
export class GetMeetingCommentReplyDto {
  @ApiProperty({
    description: 'Unique identifier of the reply comment.',
    example: 'f7a8b959-e990-491f-b06c-a5f6c7e2a877',
  })
  id!: string;

  @ApiProperty({
    description: 'Text content of the reply.',
    example: 'Thanks for the clarification!',
  })
  content!: string;

  @ApiProperty({
    description: 'Timestamp when the reply was created.',
    example: '2025-11-10T15:11:55.338Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the reply was last updated.',
    example: '2025-11-10T15:23:52.618Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Whether the reply is marked as resolved.',
    example: false,
  })
  resolved!: boolean;

  @ApiProperty({
    description: 'Param for editor',
    example: 100,
    nullable: true,
    type: Number,
  })
  from!: number | null;

  @ApiProperty({
    description: 'Param for editor',
    example: 150,
    nullable: true,
    type: Number,
  })
  to!: number | null;

  @ApiProperty({
    description: 'Tech varibale.',
    example: 'f7a8b959-e990-491f-b06c-a5f6c7e2a877',
    nullable: true,
    required: false,
    type: String,
  })
  editorDataCommentId!: string | null;

  @ApiProperty({
    description: 'Param for ceparate before or after meeting',
    example: 'before',
  })
  type!: TypeMeetingPage;

  @ApiProperty({
    description: 'Information about the author of the reply.',
    type: () => CommentAuthorInfoDto,
  })
  author!: CommentAuthorInfoDto;
}

export class GetMeetingCommentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the comment.',
    example: 'ce6f7cdb-52f2-460a-aeec-d7a83222456f',
  })
  id!: string;

  @ApiProperty({
    description: 'Text content of the comment.',
    example: 'Please clarify this point.',
  })
  content!: string;

  @ApiProperty({
    description: 'Timestamp when the comment was created.',
    example: '2025-11-10T15:07:06.898Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the comment was last updated.',
    example: '2025-11-10T15:07:06.898Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Whether the comment is marked as resolved.',
    example: false,
  })
  resolved!: boolean;

  @ApiProperty({
    description: 'Param for editor',
    example: 123,
    nullable: true,
    type: Number,
  })
  from!: number | null;

  @ApiProperty({
    description: 'Param for editor',
    example: 344,
    nullable: true,
    type: Number,
  })
  to!: number | null;

  @ApiProperty({
    description: 'Tech varibale.',
    example: 'f7a8b959-e990-491f-b06c-a5f6c7e2a877',
    nullable: true,
    required: false,
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

  @ApiProperty({
    description: 'List of replies to this comment (1 level deep).',
    type: () => [GetMeetingCommentReplyDto],
  })
  replies!: GetMeetingCommentReplyDto[];
}
