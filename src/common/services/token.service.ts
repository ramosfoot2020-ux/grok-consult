import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { randomUUID } from 'node:crypto';

import { User } from '@prisma/client';
import { Cache } from 'cache-manager';

import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { RolesEnum } from '@src/users/enums/roles.enum';

import { errorMessages } from '../error-messages';

import { HashService } from './hash.service';

@Injectable()
export class TokenService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userCompaniesService: UserCompaniesService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async generateTokens(user: Partial<User>, companyId?: string) {
    let companyIdToSet;
    let role: RolesEnum;

    const userCompaniesInfo = await this.userCompaniesService.getUserCompaniesInfoByUserId(
      user.id!,
    );

    if (companyId) {
      const userCompanyInfo = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
        user.id!,
        companyId,
      );

      if (!userCompanyInfo) {
        throw new BadRequestException(errorMessages.BadRequestException.CANNOT_CHANGE_COMPANY());
      }

      companyIdToSet = companyId;
      role = userCompanyInfo.role as RolesEnum;
    } else {
      const firstCompany = userCompaniesInfo[0];

      role = firstCompany!.role as RolesEnum;
      companyIdToSet = firstCompany!.companyId;
    }

    const accessToken = await this.jwtService.signAsync(
      {
        userId: user.id,
        companyId: companyIdToSet || null,
        role: role || null,
        email: user.email,
      },
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        secret: process.env.JWT_ACCESS_SECRET,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        userId: user.id,
        companyId: companyIdToSet || null,
        role: userCompaniesInfo[0]?.role || null,
      },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(refreshToken: string) {
    const payload = this.jwtService.decode(refreshToken);
    const hashedToken = await this.hashService.createRefreshTokenHash(refreshToken);
    const key = `refresh-${hashedToken}`;
    const ttl = payload.exp * 1000 - Date.now();

    await this.cacheManager.set(key, payload.userId, ttl);
  }

  async generateTokenForInvite() {
    return this.jwtService.signAsync(
      {
        key: randomUUID(),
      },
      {
        expiresIn: '1d',
        secret: process.env.JWT_INVITE_SECRET,
      },
    );
  }
}
