import { PickType } from '@nestjs/swagger';

import { RegisterDto } from '@src/auth/dto/register.dto';

export class CreateUserDto extends PickType(RegisterDto, [
  'email',
  'firstName',
  'lastName',
] as const) {
  salt!: Buffer;
  password!: string;
  mainCompanyId!: string;
}
