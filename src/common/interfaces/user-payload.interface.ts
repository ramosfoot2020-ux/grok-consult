import { RolesEnum } from '@src/users/enums/roles.enum';

export interface UserPayloadInterface {
  userId: string;
  companyId: string;
  role: RolesEnum;
  email: string;
  accessToken: string;
  refreshToken: string;
}
