import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, PrismaClient, UserCompany } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';
import { errorMessages } from '@src/common/error-messages';
import { UsersService } from '@src/users/users.service';

import { LinkUserToCompanyDto } from './dto/link-user-to-company.dto';

@Injectable()
export class UserCompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async linkUserToCompany(
    dto: LinkUserToCompanyDto,
    prisma: PrismaClient | Prisma.TransactionClient = this.prisma,
  ) {
    const company = await prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException(errorMessages.NotFoundException.COMPANY_NOT_FOUND());
    }

    const user = await this.userService.getUserById(dto.userId, prisma);

    if (!user) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const isUserAlreadyLinked = await prisma.userCompany.findFirst({
      where: { userId: dto.userId, companyId: dto.companyId },
    });

    if (isUserAlreadyLinked) {
      throw new BadRequestException(errorMessages.BadRequestException.USER_ALREADY_LINKED());
    }

    await prisma.userCompany.create({
      data: {
        userId: dto.userId,
        companyId: dto.companyId,
        role: dto.role,
        nickname: `${user.firstName} ${user.lastName}`,
      },
    });
  }

  async getUserCompaniesInfoByUserId(userId: string) {
    return this.prisma.userCompany.findMany({
      where: { userId },
      select: {
        companyId: true,
        role: true,
      },
    });
  }

  async getUserCompanyByUserIdAndCompanyId(
    userId: string,
    companyId: string,
  ): Promise<UserCompany | null> {
    return this.prisma.userCompany.findFirst({
      where: { userId, companyId },
    });
  }

  async getUserCompaniesByUsersIdsAndCompanyId(
    ids: string[],
    companyId: string,
  ): Promise<UserCompany[]> {
    return this.prisma.userCompany.findMany({
      where: { userId: { in: ids }, companyId },
    });
  }
}
