import { BlocksTypes } from '@prisma/client';

import { SummaryWithCitationsDto } from '@src/summarization/dto/responses/summary.responses.dto';
import { LocaleEnum } from '@src/common/enums/locale.enum';
import { AdditionalBlockDto } from '@src/meeting-notes/dto/additional-block.dto';
import {
  localizedNoItemsMessage,
  localizedSectionTitles,
} from '@src/meeting-notes/utils/summary-locale-section-titles';

export const convertSummaryToTiptap = (
  summaryDto: SummaryWithCitationsDto,
  locale: LocaleEnum,
): AdditionalBlockDto[] => {
  const blocks: AdditionalBlockDto[] = [];
  const summaryData = summaryDto.summary;

  const sectionTitles: Record<string, string> =
    localizedSectionTitles[locale] || localizedSectionTitles.en;

  for (const key in sectionTitles) {
    if (Object.prototype.hasOwnProperty.call(summaryData, key)) {
      const title = sectionTitles[key];
      const points = summaryData[key];

      const headingNode = {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: title }],
      };

      const headingBlock = new AdditionalBlockDto();
      headingBlock.source = 'custom';
      headingBlock.type = BlocksTypes.HEADING;
      headingBlock.body = headingNode;
      blocks.push(headingBlock);

      const listItems = [];

      if (points && points.length > 0) {
        for (const point of points) {
          const textNode = {
            type: 'text',
            text: point.point || '',
            marks: [] as { type: string; attrs?: Record<string, any> }[],
          };

          if (point.source_segments && point.source_segments.length > 0) {
            textNode.marks.push({
              type: 'timestamp',
              attrs: {
                source_segments: point.source_segments,
              },
            });
          }

          listItems.push({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [textNode],
              },
            ],
          });
        }
      } else {
        listItems.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: localizedNoItemsMessage[locale] || localizedSectionTitles.en,
                },
              ],
            },
          ],
        });
      }

      const bulletListNode = { type: 'bulletList', content: listItems };

      const bulletListBlock = new AdditionalBlockDto();
      bulletListBlock.source = 'custom';
      bulletListBlock.type = BlocksTypes.BULLET_LIST;
      bulletListBlock.body = bulletListNode;
      blocks.push(bulletListBlock);
    }
  }

  return blocks;
};
