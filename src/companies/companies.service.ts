import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { randomBytes } from 'crypto';

import { Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';
import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { errorMessages } from '@src/common/error-messages';
import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { UploadsService } from '@src/upload/uploads.service';
import { FilesRouteEnum } from '@src/upload/enums/upload-routes.enum';
import { GetAllCompanyUsersQueryDto } from '@src/companies/dto/get-all-company-users.query.dto';
import { GetAllCompanyUsersResponseDto } from '@src/companies/dto/responses/company-user.response.dto';
import { UserStatusesEnum } from '@src/users/enums/user-statuses.enum';
import { getAllCompanyUsers } from '@src/users-management/populate/get-all-company-users';
import { createCompanyPopulate } from '@src/users-management/populate/create-company';

import { CreateCompanyDto } from './dto/create-company.dto';
import { ChangeCompanyNameDto } from './dto/change-company-name.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userCompaniesService: UserCompaniesService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createCompanyRecord(
    createCompanyDto: CreateCompanyDto,
    prisma: PrismaClient | Prisma.TransactionClient = this.prisma,
  ) {
    return prisma.company.create({
      data: createCompanyDto,
    });
  }

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    userId: string,
    prisma: PrismaClient | Prisma.TransactionClient = this.prisma,
  ) {
    const company = await prisma.company.create({
      data: createCompanyDto,
    });

    const allUserCompanyNames = await this.prisma.company.findMany({
      where: {
        users: { some: { userId } },
      },
      select: { name: true },
    });

    const sameName = allUserCompanyNames.some(
      (c) => c.name.toLowerCase().trim() === createCompanyDto.name.toLowerCase().trim(),
    );

    if (sameName && allUserCompanyNames.length > 1) {
      throw new BadRequestException(errorMessages.BadRequestException.COMPANY_NAME_ALREADY_USED());
    }

    await this.userCompaniesService.linkUserToCompany(
      {
        userId,
        companyId: company.id,
        role: RolesEnum.OWNER,
      },
      prisma,
    );

    const createdCompany = await prisma.company.findUniqueOrThrow({
      where: { id: company.id },
      include: createCompanyPopulate(company.id),
    });

    return createdCompany;
  }

  async changeCompanyName(
    user: UserPayloadInterface,
    changeCompanyNameDto: ChangeCompanyNameDto,
    companyId: string,
  ) {
    const { name } = changeCompanyNameDto;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(errorMessages.NotFoundException.COMPANY_NOT_FOUND());
    }

    const userCompany = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      user.userId,
      companyId,
    );

    if (!userCompany) {
      throw new BadRequestException(
        errorMessages.BadRequestException.CANNOT_UPDATE_INFO_OF_OTHER_COMPANY(),
      );
    }

    const allUserCompanyNames = await this.prisma.company.findMany({
      where: {
        users: { some: { userId: user.userId } },
      },
      select: { name: true },
    });

    if (
      allUserCompanyNames.some((c) => c.name.toLowerCase().trim() === name.toLowerCase().trim())
    ) {
      throw new BadRequestException(errorMessages.BadRequestException.COMPANY_NAME_ALREADY_USED());
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: { name },
    });
  }

  async generateAvatarUploadUrl(
    userCompanyId: string,
    companyId: string,
    fileName: string,
    fileType: string,
  ) {
    if (userCompanyId !== companyId) {
      throw new BadRequestException(
        errorMessages.BadRequestException.CANNOT_UPDATE_INFO_OF_OTHER_COMPANY(),
      );
    }

    const uniqueFileName = `${randomBytes(16).toString('hex')}-${fileName}`;
    const s3Key = `${FilesRouteEnum['COMPANY_AVATAR']}/${companyId}/${uniqueFileName}`;

    const { presignedUrl } = await this.uploadsService.getPresignedUrl({
      bucket: this.uploadsService.publicBucketName,
      s3Key,
      fileType,
    });

    return { presignedUrl, uniqueFileName };
  }

  async confirmAvatarUpload(companyId: string, uniqueFileName: string) {
    const s3Key = `${FilesRouteEnum['COMPANY_AVATAR']}/${companyId}/${uniqueFileName}`;
    const bucket = this.uploadsService.publicBucketName;

    await this.uploadsService.verifyFileExists(bucket, s3Key);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { avatar: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const finalImageUrl = `https://${bucket}.s3.${this.uploadsService.region}.amazonaws.com/${s3Key}`;

    if (company.avatar && company.avatar !== finalImageUrl) {
      const oldKey = new URL(company.avatar).pathname.substring(1);
      await this.uploadsService.deleteFile(bucket, oldKey);
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: { avatar: finalImageUrl },
    });

    return { success: true, avatar: finalImageUrl };
  }

  async getAllCompanyUsers(
    user: UserPayloadInterface,
    query: GetAllCompanyUsersQueryDto,
  ): Promise<GetAllCompanyUsersResponseDto> {
    const where: Prisma.UserCompanyWhereInput = {
      companyId: user.companyId,
    };

    const { roles, status, search } = query;

    if (roles?.length) {
      where.role = { in: roles };
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
      where.OR = clauses;
    }

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, userCompanies] = await this.prisma.$transaction([
      this.prisma.userCompany.count({ where }),
      this.prisma.userCompany.findMany({
        where,
        select: getAllCompanyUsers,
        skip: query.skip,
        take: query.take,
        orderBy: {
          user: {
            firstName: 'asc',
          },
        },
      }),
    ]);

    const formattedUsers = userCompanies.map((uc) => ({
      id: uc.user.id,
      firstName: uc.user.firstName,
      lastName: uc.user.lastName,
      email: uc.user.email,
      avatar: uc.user.avatar,
      role: uc.role,
      createdAt: uc.createdAt,
      removedAt: uc.removedAt,
      blockedAt: uc.blockedAt,
      nickname: uc.nickname,
    }));

    return {
      users: formattedUsers,
      total,
    };
  }
}
