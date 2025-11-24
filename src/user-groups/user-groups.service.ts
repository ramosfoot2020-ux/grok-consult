import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';
import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { errorMessages } from '@src/common/error-messages';
import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { userGroupWithDetailsPopulate } from '@src/user-groups/populate/user-group-with-details';

import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { GetAllUserGroupsQueryDto } from './dto/get-all-user-groups-query.dto';
import {
  GetAllUserGroupsResponseDto,
  UserGroupDetailedResponseDto,
} from './dto/responses/user-group.response.dto';

const userGroupWithDetailsArgs = Prisma.validator<Prisma.UserGroupDefaultArgs>()(
  userGroupWithDetailsPopulate,
);

type UserGroupWithDetails = Prisma.UserGroupGetPayload<typeof userGroupWithDetailsArgs>;

@Injectable()
export class UserGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userCompaniesService: UserCompaniesService,
  ) {}

  async create(
    dto: CreateUserGroupDto,
    user: UserPayloadInterface,
  ): Promise<UserGroupDetailedResponseDto> {
    await this.checkGroupNameExists(dto.name, user.companyId);

    const creatorUserCompany = await this.findCreatorUserCompany(user.userId, user.companyId);

    const memberUserCompanyIds = await this.validateAndFetchMemberUserCompanyIds(
      dto.memberIds,
      user.companyId,
    );

    const { memberIds, ...restOfDto } = dto;

    const group = await this.prisma.userGroup.create({
      data: {
        ...restOfDto,
        companyId: user.companyId,
        createdById: creatorUserCompany.id,
        members: {
          createMany: {
            data: memberUserCompanyIds.map((userCompanyId) => ({
              userCompanyId,
            })),
          },
        },
      },
      include: userGroupWithDetailsArgs.include,
    });

    return this.buildUserGroupDetailedResponse(group);
  }

  async findAll(
    user: UserPayloadInterface,
    query: GetAllUserGroupsQueryDto,
  ): Promise<GetAllUserGroupsResponseDto> {
    const where: Prisma.UserGroupWhereInput = {
      companyId: user.companyId,
    };

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [total, groups] = await this.prisma.$transaction([
      this.prisma.userGroup.count({ where }),
      this.prisma.userGroup.findMany({
        where,
        include: userGroupWithDetailsArgs.include,
        skip: query.skip,
        take: query.take,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const formattedGroups = groups.map((group) => this.buildUserGroupDetailedResponse(group));

    return {
      groups: formattedGroups,
      total,
    };
  }

  async findOne(id: string, user: UserPayloadInterface): Promise<UserGroupDetailedResponseDto> {
    await this.findGroupAndAuthorize(id, user.companyId);

    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      include: userGroupWithDetailsArgs.include,
    });

    if (!group) {
      throw new NotFoundException(errorMessages.NotFoundException.USERS_GROUP_NOT_EXISTS());
    }

    return this.buildUserGroupDetailedResponse(group);
  }

  async update(
    id: string,
    dto: UpdateUserGroupDto,
    user: UserPayloadInterface,
  ): Promise<UserGroupDetailedResponseDto> {
    await this.findGroupAndAuthorize(id, user.companyId);

    if (dto.name) {
      await this.checkGroupNameExists(dto.name, user.companyId, id);
    }

    const { memberIds, ...restOfDto } = dto;
    const data: Prisma.UserGroupUpdateInput = { ...restOfDto };

    if (memberIds) {
      const memberUserCompanyIds = await this.validateAndFetchMemberUserCompanyIds(
        memberIds,
        user.companyId,
      );

      data.members = {
        deleteMany: {},
        createMany: {
          data: memberUserCompanyIds.map((userCompanyId) => ({
            userCompanyId,
          })),
        },
      };
    }

    const updatedGroup = await this.prisma.userGroup.update({
      where: { id },
      data,
      include: userGroupWithDetailsArgs.include,
    });

    return this.buildUserGroupDetailedResponse(updatedGroup);
  }

  async remove(id: string, user: UserPayloadInterface) {
    await this.findGroupAndAuthorize(id, user.companyId);

    await this.prisma.userGroup.delete({
      where: { id },
    });

    return { success: true };
  }

  private async findCreatorUserCompany(userId: string, companyId: string) {
    const userCompany = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      userId,
      companyId,
    );
    if (!userCompany) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_NOT_ALLOWED());
    }
    return userCompany;
  }

  private async findGroupAndAuthorize(id: string, companyId: string) {
    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!group) {
      throw new NotFoundException(errorMessages.NotFoundException.USERS_GROUP_NOT_EXISTS());
    }

    if (group.companyId !== companyId) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_NOT_ALLOWED());
    }

    return group;
  }

  private async checkGroupNameExists(name: string, companyId: string, excludeId?: string) {
    const where: Prisma.UserGroupWhereInput = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      companyId,
      id: excludeId ? { not: excludeId } : undefined,
    };

    const existing = await this.prisma.userGroup.findFirst({ where });

    if (existing) {
      throw new BadRequestException(
        errorMessages.BadRequestException.USERS_GROUP_NAME_ALREADY_EXISTS(),
      );
    }
  }

  private async validateAndFetchMemberUserCompanyIds(
    memberUserIds: string[] | undefined,
    companyId: string,
  ): Promise<string[]> {
    const idSet = new Set(memberUserIds || []);
    const uniqueUserIds = Array.from(idSet);

    if (uniqueUserIds.length === 0) return [];

    const participants = await this.userCompaniesService.getUserCompaniesByUsersIdsAndCompanyId(
      uniqueUserIds,
      companyId,
    );

    if (participants.length !== uniqueUserIds.length) {
      const foundIds = new Set(participants.map((p) => p.userId));
      const missingIds = uniqueUserIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND(missingIds));
    }

    return participants.map((p) => p.id);
  }

  private buildUserGroupDetailedResponse(
    group: UserGroupWithDetails,
  ): UserGroupDetailedResponseDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      color: group.color,
      companyId: group.companyId,
      createdBy: group.createdBy
        ? {
            id: group.createdBy.id,
            nickname: group.createdBy.nickname,
            userId: group.createdBy.userId,
            role: group.createdBy.role,
            email: group.createdBy.user.email,
            firstName: group.createdBy.user.firstName,
            lastName: group.createdBy.user.lastName,
            avatar: group.createdBy.user.avatar,
          }
        : null,
      members: group.members.map((m) => ({
        id: m.userCompany.id,
        nickname: m.userCompany.nickname,
        userId: m.userCompany.userId,
        role: m.userCompany.role,
        email: m.userCompany.user.email,
        firstName: m.userCompany.user.firstName,
        lastName: m.userCompany.user.lastName,
        createdAt: m.createdAt,
        avatar: m.userCompany.user.avatar,
      })),
    };
  }
}
