import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { PrismaService } from '@src/prisma/prisma.service';
import { UserStatusesEnum } from '@src/users/enums/user-statuses.enum';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { UsersService } from '@src/users/users.service';
import { errorMessages } from '@src/common/error-messages';
import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { findManyCompany } from '@src/users-management/populate/find-many-company';

import { UpdateUserData } from './dto/update-user-data.dto';
import { GetAllUsersQueryDto } from './dto/get-all-users.query.dto';

@Injectable()
export class UsersManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly userCompaniesService: UserCompaniesService,
  ) {}

  async getAllUsers(user: UserPayloadInterface, query: GetAllUsersQueryDto) {
    const { skip = 0, take = 10, status, roles, search } = query;

    const userCompanyWhere: Prisma.UserCompanyWhereInput = {
      companyId: user.companyId,
    };

    if (roles?.length) {
      userCompanyWhere.role = { in: roles };
    }

    if (search) {
      userCompanyWhere.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status?.length) {
      const clauses: Prisma.UserCompanyWhereInput[] = [];

      if (status.includes(UserStatusesEnum.ACTIVE)) {
        clauses.push({ blockedAt: null, removedAt: null });
      }
      if (status.includes(UserStatusesEnum.BLOCKED)) {
        clauses.push({ blockedAt: { not: null } });
      }
      if (status.includes(UserStatusesEnum.DELETED)) {
        clauses.push({ removedAt: { not: null } });
      }

      userCompanyWhere.OR = clauses;
    }

    const [total, userCompanies] = await this.prisma.$transaction([
      this.prisma.userCompany.count({
        where: userCompanyWhere,
      }),
      this.prisma.userCompany.findMany({
        where: userCompanyWhere,
        select: findManyCompany,
        skip,
        take,
        orderBy: [{ blockedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    const mappedCompanies = userCompanies.map((uc) => ({
      ...uc,
      groups: uc.groups.map((g) => g.userGroup),
    }));

    return {
      userCompanies: mappedCompanies,
      total,
    };
  }

  async changeUserRole(userId: string, role: RolesEnum, user: UserPayloadInterface) {
    const userCompanyInfo = await this.validateUserCompany(userId, user);

    if (userId === user.userId) {
      throw new BadRequestException(
        errorMessages.BadRequestException.CANNOT_CHANGE_ROLE_FOR_YOURSELF(),
      );
    }

    if (userCompanyInfo.role === role) {
      throw new BadRequestException(
        errorMessages.BadRequestException.USER_ALREADY_HAS_THIS_ROLE(role),
      );
    }

    await this.prisma.userCompany.update({
      where: { id: userCompanyInfo.id },
      data: {
        role: role,
      },
    });

    return {
      success: true,
    };
  }

  async blockUser(userId: string, user: UserPayloadInterface) {
    const userCompanyInfo = await this.validateUserCompany(userId, user);

    if (userId === user.userId) {
      throw new BadRequestException(errorMessages.BadRequestException.CANNOT_BLOCK_YOURSELF());
    }

    if (userCompanyInfo.blockedAt != null) {
      throw new BadRequestException(errorMessages.BadRequestException.USER_ALREADY_BLOCKED());
    }

    await this.prisma.userCompany.update({
      where: { id: userCompanyInfo.id },
      data: {
        blockedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }

  async unblockUser(userId: string, user: UserPayloadInterface) {
    const userCompanyInfo = await this.validateUserCompany(userId, user);

    if (userId === user.userId) {
      throw new BadRequestException(errorMessages.BadRequestException.CANNOT_UNBLOCK_YOURSELF());
    }

    if (userCompanyInfo.blockedAt == null) {
      throw new BadRequestException(errorMessages.BadRequestException.USER_ALREADY_BLOCKED());
    }

    await this.prisma.userCompany.update({
      where: { id: userCompanyInfo.id },
      data: {
        blockedAt: null,
      },
    });

    return {
      success: true,
    };
  }

  async updateUserData(userId: string, user: UserPayloadInterface, dto: UpdateUserData) {
    const { nickname } = dto;

    const userCompanyInfo = await this.validateUserCompany(userId, user);

    if (userId === user.userId) {
      throw new BadRequestException(errorMessages.BadRequestException.CANNOT_CHANGE_OWN_DATA());
    }

    if (userCompanyInfo.role === RolesEnum.OWNER) {
      throw new BadRequestException(errorMessages.BadRequestException.CANNOT_CHANGE_OWNER_DATA());
    }

    await this.prisma.userCompany.update({
      where: { id: userCompanyInfo.id },
      data: {
        nickname,
      },
    });

    return {
      success: true,
    };
  }

  async deleteUser(userId: string, user: UserPayloadInterface) {
    const userCompanyInfo = await this.validateUserCompany(userId, user);

    // comment this to set user can delete own in other company
    // if (userId === user.userId) {
    //   throw new BadRequestException(errorMessages.BadRequestException.CANNOT_CHANGE_OWN_DATA());
    // }

    if (userCompanyInfo.role === RolesEnum.OWNER) {
      throw new BadRequestException(errorMessages.BadRequestException.CANNOT_CHANGE_OWNER_DATA());
    }

    await this.prisma.userCompany.delete({
      where: { id: userCompanyInfo.id },
    });

    return {
      success: true,
    };
  }

  private validateUserCompany = async (userId: string, user: UserPayloadInterface) => {
    const userInfo = await this.userService.getUserById(userId);

    if (!userInfo) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const userCompanyInfo = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      userInfo.id,
      user.companyId,
    );

    if (!userCompanyInfo) {
      throw new BadRequestException(
        errorMessages.BadRequestException.CANNOT_UPDATE_USER_DATA_FROM_OTHER_COMPANY(),
      );
    }

    return userCompanyInfo;
  };
}
