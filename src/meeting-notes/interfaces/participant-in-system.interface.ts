import { Roles } from '@prisma/client';
export interface ParticipantInSystemInterface {
  id: string;
  userId: string;
  companyId: string;
  nickname: string;
  role: Roles;
  blockedAt: Date | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
