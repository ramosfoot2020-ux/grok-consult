import { BlocksTypes } from '@prisma/client';

import { AdditionalBlockDto } from '@src/meeting-notes/dto/additional-block.dto';

export const convertMarkdownBlockToTiptap = (
  blockString: string,
  titlesToKeys: Record<string, string>,
): AdditionalBlockDto | null => {
  if (blockString.startsWith('## ')) {
    const text = blockString.substring(3).trim();
    const key = titlesToKeys[text];
    console.log(`[PARSER] Converted heading: ${text} (key: ${key || 'N/A'})`);

    const headingNode = {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: text }],
    };

    const headingBlock = new AdditionalBlockDto();
    headingBlock.source = 'custom';
    headingBlock.type = BlocksTypes.HEADING;
    headingBlock.body = headingNode;
    return headingBlock;
  }

  if (blockString.startsWith('- ')) {
    let text = blockString.substring(2).trim();
    const citationMatch = text.match(/\[([\d, ]+)\]$/);
    const marks = [];
    const source_segments = [];
    if (citationMatch && citationMatch[1]) {
      text = text.substring(0, citationMatch.index).trim();
      const ids = citationMatch[1].split(',').map((id) => parseInt(id.trim(), 10));
      for (const id of ids) {
        source_segments.push({ start_ms: id, end_ms: id + 1000 });
      }
      marks.push({
        type: 'timestamp',
        attrs: { source_segments },
      });
    }

    const bulletListNode = {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: text,
                  marks: marks,
                },
              ],
            },
          ],
        },
      ],
    };

    const bulletListBlock = new AdditionalBlockDto();
    bulletListBlock.source = 'custom';
    bulletListBlock.type = BlocksTypes.BULLET_LIST;
    bulletListBlock.body = bulletListNode;
    return bulletListBlock;
  }

  return null;
};
