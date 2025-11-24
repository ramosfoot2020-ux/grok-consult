import { ApiProperty } from '@nestjs/swagger';

export class SegmentReferenceDto {
  @ApiProperty({ description: 'Start time of the segment in milliseconds.' })
  start_ms!: number;

  @ApiProperty({ description: 'End time of the segment in milliseconds.' })
  end_ms!: number;
}

export class SummaryPointDto {
  @ApiProperty({
    description: 'A single sentence or key point of the summary.',
    example: 'The team discussed Q4 goals, focusing on marketing and development.',
  })
  point!: string;

  @ApiProperty({
    description: 'References to the original segments this point is based on.',
    type: [SegmentReferenceDto],
  })
  source_segments!: SegmentReferenceDto[];
}

export class SummaryWithCitationsDto {
  @ApiProperty({
    description:
      'A structured summary object. The keys of this object will match the sections of the requested template.',
    example: {
      type: 'object',
      announcements: [],
      reviewOfProgress: [
        /* SummaryPointDto objects */
      ],
    },
  })
  summary!: Record<string, SummaryPointDto[]>;

  @ApiProperty({
    description: 'Details about the token usage for the API call.',
    example: { promptTokens: 512, completionTokens: 256, totalTokens: 768 },
    required: false,
  })
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
