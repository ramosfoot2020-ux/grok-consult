import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';

import { LocaleEnum } from '@src/common/enums/locale.enum';

export class TogglePublicSharingDto {
  @ApiProperty({
    description: 'Set to true to enable public access, false to disable it.',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic!: boolean;

  @ApiProperty({
    description: "The user's current locale to build the correct public URL.",
    example: LocaleEnum.EN,
    enum: LocaleEnum,
  })
  @IsEnum(LocaleEnum)
  @IsNotEmpty()
  locale!: LocaleEnum;
}
