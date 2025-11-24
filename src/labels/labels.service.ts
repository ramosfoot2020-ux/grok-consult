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
import { GetAllLabelsResponseDto } from '@src/labels/dto/responses/find-all-label.response.dto';
import { GetAllLabelsQueryDto } from '@src/labels/dto/find-all-label.dto';

import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLabelDto, user: UserPayloadInterface) {
    const existingLabel = await this.prisma.label.findFirst({
      where: {
        name: dto.name,
        companyId: user.companyId,
      },
    });

    if (existingLabel) {
      throw new BadRequestException(errorMessages.BadRequestException.LABEL_NAME_ALREADY_EXISTS());
    }

    return this.prisma.label.create({
      data: {
        name: dto.name,
        companyId: user.companyId,
      },
    });
  }

  async findAll(
    user: UserPayloadInterface,
    query: GetAllLabelsQueryDto,
  ): Promise<GetAllLabelsResponseDto> {
    const where: Prisma.LabelWhereInput = {
      companyId: user.companyId,
    };

    // Add search condition if provided
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [total, labels] = await this.prisma.$transaction([
      this.prisma.label.count({ where }),
      this.prisma.label.findMany({
        where,
        select: {
          id: true,
          name: true,
        },
        skip: query.skip,
        take: query.take,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      labels,
      total,
    };
  }

  async findOne(id: string, user: UserPayloadInterface) {
    return this.findLabelAndAuthorize(id, user.companyId);
  }

  async update(id: string, dto: UpdateLabelDto, user: UserPayloadInterface) {
    await this.findLabelAndAuthorize(id, user.companyId);

    if (dto.name) {
      const existingLabel = await this.prisma.label.findFirst({
        where: {
          name: dto.name,
          companyId: user.companyId,
          id: { not: id },
        },
      });

      if (existingLabel) {
        throw new BadRequestException(
          errorMessages.BadRequestException.LABEL_NAME_ALREADY_EXISTS(),
        );
      }
    }

    return this.prisma.label.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: UserPayloadInterface) {
    await this.findLabelAndAuthorize(id, user.companyId);

    await this.prisma.label.delete({
      where: { id },
    });

    return { success: true };
  }

  private async findLabelAndAuthorize(id: string, companyId: string) {
    const label = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!label) {
      throw new NotFoundException(errorMessages.NotFoundException.LABEL_NOT_FOUND());
    }

    if (label.companyId !== companyId) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_NOT_ALLOWED());
    }

    return label;
  }
}
