import { SetMetadata } from '@nestjs/common/decorators';

export const Roles = (...args: string[]) => SetMetadata('roles', args);
