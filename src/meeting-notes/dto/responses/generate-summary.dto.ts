import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';

import { LocaleEnum } from '@src/common/enums/locale.enum';

export class GenerateSummaryDto {
  @ApiProperty({
    description:
      "The desired language for the summary. Defaults to English ('en') if not provided.",
    example: LocaleEnum.UA,
    enum: LocaleEnum,
    required: true,
  })
  @IsEnum(LocaleEnum)
  locale!: LocaleEnum;
}
