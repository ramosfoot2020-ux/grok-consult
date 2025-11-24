import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangeCompanyDto {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  @IsUUID()
  companyId!: string;
}
