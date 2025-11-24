import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PrismaService } from 'src/prisma/prisma.service';

import { errorMessages } from '@src/common/error-messages';

@Injectable()
export class JwtUserGuard extends AuthGuard('jwt-user') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;
    if (!ok) {
      throw new UnauthorizedException();
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const userInfo = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        emailConfirmed: true,
        blockedAt: true,
        deletedAt: true,
      },
    });

    if (!userInfo) {
      throw new UnauthorizedException();
    }

    if (userInfo.blockedAt) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_BLOCKED);
    }

    if (userInfo.deletedAt) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_BLOCKED);
    }

    if (!userInfo.emailConfirmed) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_EMAIL_NOT_CONFIRMED);
    }

    return true;
  }
}
