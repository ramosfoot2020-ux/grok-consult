import { applyDecorators } from '@nestjs/common';

import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * A custom decorator that combines email validation and transformation.
 * It trims whitespace and converts the email to lowercase.
 */
export function IsNormalizedEmail() {
  return applyDecorators(
    IsNotEmpty(),
    IsEmail(),
    Transform(({ value }: { value: unknown }) => {
      if (typeof value === 'string') {
        return value.trim().toLowerCase();
      }
      return value;
    }),
  );
}
