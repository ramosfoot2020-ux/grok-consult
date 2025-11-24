import { Request } from 'express';

import { UserPayloadInterface } from './user-payload.interface';

export interface RequestWithUser extends Request {
  user: UserPayloadInterface;
}
