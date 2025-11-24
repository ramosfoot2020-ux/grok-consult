import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsIn, IsObject } from 'class-validator';
import { BlocksTypes } from '@prisma/client';

export class AdditionalBlockDto {
  @ApiProperty({
    description: "The source of the block, either 'editor' or 'custom'.",
    example: 'editor',
    enum: ['editor', 'custom'],
  })
  @IsIn(['editor', 'custom'])
  source!: 'editor' | 'custom';

  @ApiProperty({
    description: 'The type of the block, matching the BlocksTypes enum.',
    enum: BlocksTypes,
    example: BlocksTypes.AGENDA_BLOCK,
  })
  @IsEnum(BlocksTypes)
  type!: BlocksTypes;

  @ApiProperty({
    description: 'The nested JSON body of the block, such as a Tiptap document.',
    type: 'object',
    additionalProperties: true,
    example: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello!' }] }],
    },
  })
  @IsObject()
  body!: Record<string, any>;

  toJSON() {
    return {
      source: this.source,
      type: this.type,
      body: this.body,
    };
  }
}
