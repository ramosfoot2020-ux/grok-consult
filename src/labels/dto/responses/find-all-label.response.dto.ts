import { ApiProperty, PickType } from '@nestjs/swagger';

import { LabelResponseDto } from '@src/labels/dto/responses/label.response.dto';

export class LabelListResponseDto extends PickType(LabelResponseDto, ['id', 'name'] as const) {}

export class GetAllLabelsResponseDto {
  @ApiProperty({
    description: 'List of labels for the current page',
    type: [LabelListResponseDto],
  })
  labels!: LabelListResponseDto[];

  @ApiProperty({
    description: 'Total number of labels matching the criteria',
    example: 42,
  })
  total!: number;
}
