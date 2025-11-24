import { Injectable, NotFoundException } from '@nestjs/common';

import { randomBytes } from 'crypto';

import { PinoLogger } from 'nestjs-pino';
import { Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';
import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { errorMessages } from '@src/common/error-messages';
import { FilesRouteEnum } from '@src/upload/enums/upload-routes.enum';
import { UploadsService } from '@src/upload/uploads.service';
import { logServiceError } from '@src/common/utils/logging';
import { UpdateMyProfileDto } from '@src/users/dto/update-my-profile.dto';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(
    dto: CreateUserDto,
    prisma: PrismaClient | Prisma.TransactionClient = this.prisma,
  ) {
    return prisma.user.create({
      data: dto,
    });
  }

  async getUserById(id: string, prisma: PrismaClient | Prisma.TransactionClient = this.prisma) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailConfirmed: true,
        featureUpdates: true,
        createdAt: true,
        updatedAt: true,
        blockedAt: true,
        deletedAt: true,
      },
    });
  }

  async findUserForAuthById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async verifyUserEmail(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        emailConfirmed: true,
      },
    });
  }

  async updateUserPassword(email: string, password: string, salt: Buffer) {
    return this.prisma.user.update({
      where: { email },
      data: {
        password,
        salt,
      },
    });
  }

  async getMyProfile(user: UserPayloadInterface) {
    const userInfo = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailConfirmed: true,
        featureUpdates: true,
        createdAt: true,
        updatedAt: true,
        blockedAt: true,
        mainCompanyId: true,
        passwordResetRequired: true,
        deletedAt: true,
        avatar: true,
        timeZone: true,

        userCompanies: {
          select: {
            companyId: true,
            role: true,
            blockedAt: true,
            removedAt: true,
            company: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!userInfo) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const currentCompanyRecord = userInfo.userCompanies.find(
      (uc) => uc.companyId === user.companyId,
    );

    if (!currentCompanyRecord) {
      throw new NotFoundException(errorMessages.NotFoundException.COMPANY_NOT_FOUND());
    }
    /////  check block in current company & replace to mainCompany when yes
    const isCurrentCompanyInactive =
      currentCompanyRecord.blockedAt !== null || currentCompanyRecord.removedAt !== null;

    let currentCompany;

    if (isCurrentCompanyInactive) {
      const mainCompanyRecord = userInfo.userCompanies.find(
        (uc) => uc.companyId === userInfo.mainCompanyId,
      );

      if (!mainCompanyRecord) {
        throw new NotFoundException(errorMessages.NotFoundException.COMPANY_NOT_FOUND());
      }

      currentCompany = {
        id: mainCompanyRecord.company.id,
        name: mainCompanyRecord.company.name,
        avatar: mainCompanyRecord.company.avatar,
        role: mainCompanyRecord.role,
      };
    } else {
      currentCompany = {
        id: currentCompanyRecord.company.id,
        name: currentCompanyRecord.company.name,
        avatar: currentCompanyRecord.company.avatar,
        role: currentCompanyRecord.role,
      };
    }
    ////////

    const userCompanies = userInfo.userCompanies
      .filter((uc) => uc.blockedAt === null && uc.removedAt === null)
      .map((uc) => ({
        id: uc.company.id,
        name: uc.company.name,
        avatar: uc.company.avatar,
        role: uc.role,
      }));

    const restOfUserInfo = {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      emailConfirmed: userInfo.emailConfirmed,
      featureUpdates: userInfo.featureUpdates,
      createdAt: userInfo.createdAt,
      updatedAt: userInfo.updatedAt,
      blockedAt: userInfo.blockedAt,
      passwordResetRequired: userInfo.passwordResetRequired,
      deletedAt: userInfo.deletedAt,
      mainCompanyId: userInfo.mainCompanyId,
      avatar: userInfo.avatar,
      timeZone: userInfo.timeZone,
    };

    return {
      ...restOfUserInfo,
      currentCompany,
      userCompanies,
    };
  }

  async updateMyProfile(user: UserPayloadInterface, dto: UpdateMyProfileDto) {
    await this.prisma.user.update({
      where: { id: user.userId },
      data: dto,
    });

    return this.getMyProfile(user);
  }

  async getUsersByEmails(emails: string[]) {
    return this.prisma.user.findMany({
      where: { email: { in: emails } },
      select: {
        id: true,
      },
    });
  }

  async generateAvatarUploadUrl(userId: string, fileName: string, fileType: string) {
    const uniqueFileName = `${randomBytes(16).toString('hex')}-${fileName}`;
    const s3Key = `${FilesRouteEnum.USER_AVATAR}/${userId}/${uniqueFileName}`;

    const { presignedUrl } = await this.uploadsService.getPresignedUrl({
      bucket: this.uploadsService.publicBucketName,
      s3Key,
      fileType,
    });

    return { presignedUrl, uniqueFileName };
  }

  async confirmAvatarUpload(userId: string, uniqueFileName: string) {
    const s3Key = `${FilesRouteEnum.USER_AVATAR}/${userId}/${uniqueFileName}`;
    const bucket = this.uploadsService.publicBucketName;

    await this.uploadsService.verifyFileExists(bucket, s3Key);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const finalImageUrl = `https://${bucket}.s3.${this.uploadsService.region}.amazonaws.com/${s3Key}`;

    if (user.avatar) {
      try {
        const oldKey = new URL(user.avatar).pathname.substring(1);
        await this.uploadsService.deleteFile(bucket, oldKey);
      } catch (error) {
        logServiceError(
          this.logger,
          error,
          'Failed to delete old avatar during new avatar upload.',
          { userId, oldAvatarUrl: user.avatar },
        );
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: finalImageUrl },
    });

    return { success: true, avatar: finalImageUrl };
  }
}
