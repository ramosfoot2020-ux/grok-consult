import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import dayjs from 'dayjs';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@src/prisma/prisma.service';
import { UsersService } from '@src/users/users.service';
import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { HashService } from '@src/common/services/hash.service';
import { EmailService } from '@src/common/services/email.service';
import { errorMessages } from '@src/common/error-messages';
import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { SchedulerService } from '@src/scheduler/scheduler.service';
import { SchedulerNamesEnum } from '@src/scheduler/enums/scheduler-names.enum';
import { SchedulerQueuesEnum } from '@src/scheduler/enums/scheduler-queues.enum';
import { TokenService } from '@src/common/services/token.service';
import { CompaniesService } from '@src/companies/companies.service';

import { CreateInviteDto } from './dto/create-invite.dto';
import { HandleInviteDto, HandleInviteExistDto } from './dto/handle-invite.dto';
import { GetAllInvitesQueryDto } from './dto/get-all-invites.query.dto';
import { InviteStatusesEnum } from './enums/invite-statuses.enum';

const untilExpired = 24;

@Injectable()
export class InvitesService {
  constructor(
    private readonly userCompaniesService: UserCompaniesService,
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly hashService: HashService,
    private readonly schedulerService: SchedulerService,
    private readonly tokenService: TokenService,
    private readonly companiesService: CompaniesService,
  ) {}

  async createEmailInvite(createInviteDto: CreateInviteDto, user: UserPayloadInterface) {
    const now = dayjs();
    const validUntil = now.add(untilExpired, 'hours').toDate();

    const sendedInvites = await this.prisma.invite.findMany({
      where: { email: { in: createInviteDto.emails }, rejectedAt: null, acceptedAt: null },
    });

    if (sendedInvites.length) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_ALREADY_SENDED());
    }

    // check exist users in current company
    const usersInCompany = await this.prisma.userCompany.findMany({
      where: {
        companyId: user.companyId,
        user: {
          email: { in: createInviteDto.emails },
        },
      },
      include: {
        user: { select: { email: true } },
      },
    });

    if (usersInCompany.length > 0) {
      const existingCompanyEmails = usersInCompany.map((uc) => uc.user.email);

      throw new BadRequestException(
        errorMessages.BadRequestException.USERS_ALREADY_IN_COMPANY(existingCompanyEmails),
      );
    }
    /////

    const invites = await this.prisma.$transaction(async (prisma) => {
      const inviteData = createInviteDto.emails.map((email) => ({
        email,
        role: createInviteDto.role,
        type: createInviteDto.inviteType,
        companyId: user.companyId,
        validUntil,
      }));

      await prisma.invite.createMany({
        data: inviteData,
        skipDuplicates: true,
      });

      return prisma.invite.findMany({
        where: { email: { in: createInviteDto.emails }, rejectedAt: null, acceptedAt: null },
      });
    });

    // collect register-users in the general system
    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: createInviteDto.emails } },
      select: { email: true },
    });

    const existingEmailsSet = new Set(existingUsers.map((u) => u.email));

    await Promise.all(
      invites.map((invite) =>
        this.schedulerService.scheduleJob(
          invite.validUntil,
          SchedulerNamesEnum.REJECT_INVITE,
          { id: invite.id },
          SchedulerQueuesEnum.INVITES_QUEUE,
        ),
      ),
    );

    await Promise.all(
      invites.map((invite) => {
        const isExisting = existingEmailsSet.has(invite.email!);

        const link = `${process.env.APP_CLIENT_URL}/accept-email-invite?inviteId=${invite.id}&expiresAt=${validUntil.toISOString()}${isExisting ? '&exist=1' : ''}`;

        const text = isExisting
          ? `Accept invitation to join company. By clicking on the link you agree to this accession: ${link}`
          : `Accept invitation to join company: ${link}`;

        return this.emailService.sendEmail({
          to: invite.email!,
          subject: 'Invitation to join company',
          text,
        });
      }),
    );

    return { success: true, count: invites.length };
  }

  async createLinkInvite(createInviteDto: CreateInviteDto, user: UserPayloadInterface) {
    const now = dayjs();
    const validUntil = now.add(untilExpired, 'hours').toDate();

    const inviteToken = await this.tokenService.generateTokenForInvite();
    const link = `${process.env.APP_CLIENT_URL}/accept-link-invite?token=${inviteToken}&expiresAt=${validUntil.toISOString()}`;

    const invite = await this.prisma.invite.create({
      data: {
        role: createInviteDto.role,
        companyId: user.companyId,
        link,
        validUntil,
        type: createInviteDto.inviteType,
      },
    });

    await this.schedulerService.scheduleJob(
      invite.validUntil,
      SchedulerNamesEnum.REJECT_INVITE,
      { id: invite.id },
      SchedulerQueuesEnum.INVITES_QUEUE,
    );

    return invite;
  }

  async getInviteById(inviteId: string) {
    return this.prisma.invite.findUnique({
      where: { id: inviteId },
    });
  }

  async acceptLinkInvite(dto: HandleInviteDto) {
    const { token } = dto;

    const invite = await this.getInviteByToken(token);

    if (!invite) {
      throw new NotFoundException(errorMessages.NotFoundException.INVITE_NOT_FOUND());
    }

    const isInviteValid = this.isInviteValid(invite.validUntil);

    if (!isInviteValid) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_DATE_IS_EXPIRED());
    }

    const salt = await this.hashService.generateSalt();
    const hashedPassword = await this.hashService.hashPassword(dto.password, salt);

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await this.userService.getUserByEmail(dto.email);
      let invitedUser;

      if (!existingUser) {
        const mainCompany = await this.companiesService.createCompanyRecord(
          {
            name: `${dto.firstName}'s Space`,
          },
          tx,
        );

        invitedUser = await this.userService.createUser(
          {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            salt,
            password: hashedPassword,
            mainCompanyId: mainCompany.id,
          },
          tx,
        );

        await this.userCompaniesService.linkUserToCompany(
          {
            userId: invitedUser.id,
            companyId: mainCompany.id,
            role: RolesEnum.OWNER,
          },
          tx,
        );
      } else {
        invitedUser = existingUser;
      }

      await this.userCompaniesService.linkUserToCompany(
        {
          userId: invitedUser.id,
          companyId: invite.companyId,
          role: invite.role as RolesEnum,
        },
        tx,
      );

      const updatedInvite = await tx.invite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: dayjs().toDate(),
        },
      });

      return { invitedUser, updatedInvite };
    });

    return result;
  }

  async acceptEmailInvite(dto: HandleInviteDto) {
    const invite = await this.getInviteById(dto.inviteId);

    if (!invite) {
      throw new BadRequestException(errorMessages.NotFoundException.INVITE_NOT_FOUND());
    }

    const isInviteValid = this.isInviteValid(invite.validUntil);

    if (!isInviteValid) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_DATE_IS_EXPIRED());
    }

    if (invite.acceptedAt) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_ALREADY_ACCEPTED());
    }

    if (invite.email !== dto.email) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_EMAIL_NOT_MATCH());
    }

    const salt = await this.hashService.generateSalt();
    const hashedPassword = await this.hashService.hashPassword(dto.password, salt);

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await this.userService.getUserByEmail(invite.email as string);
      let invitedUser;

      if (!existingUser) {
        const mainCompany = await this.companiesService.createCompanyRecord(
          {
            name: `${dto.firstName}'s Space`,
          },
          tx,
        );

        invitedUser = await this.userService.createUser(
          {
            email: invite.email!,
            firstName: dto.firstName,
            lastName: dto.lastName,
            salt,
            password: hashedPassword,
            mainCompanyId: mainCompany.id,
          },
          tx,
        );

        await this.userCompaniesService.linkUserToCompany(
          {
            userId: invitedUser.id,
            companyId: mainCompany.id,
            role: RolesEnum.OWNER,
          },
          tx,
        );
      } else {
        invitedUser = existingUser;
      }

      await this.userCompaniesService.linkUserToCompany(
        {
          userId: invitedUser.id,
          companyId: invite.companyId,
          role: invite.role as RolesEnum,
        },
        tx,
      );

      const updatedInvite = await tx.invite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: dayjs().toDate(),
        },
      });

      return { invitedUser, updatedInvite };
    });

    return result;
  }

  async acceptEmailExistInvite(dto: HandleInviteExistDto) {
    const invite = await this.getInviteById(dto.inviteId);

    if (!invite) {
      throw new BadRequestException(errorMessages.NotFoundException.INVITE_NOT_FOUND());
    }

    const isInviteValid = this.isInviteValid(invite.validUntil);

    if (!isInviteValid) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_DATE_IS_EXPIRED());
    }

    if (invite.acceptedAt) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_ALREADY_ACCEPTED());
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await this.userService.getUserByEmail(invite.email as string);
      if (!existingUser) {
        throw new BadRequestException(errorMessages.BadRequestException.INVITE_EMAIL_NOT_MATCH());
      }

      await this.userCompaniesService.linkUserToCompany(
        {
          userId: existingUser.id,
          companyId: invite.companyId,
          role: invite.role as RolesEnum,
        },
        tx,
      );

      const updatedInvite = await tx.invite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: dayjs().toDate(),
        },
      });

      const invitedUser = existingUser;
      return { invitedUser, updatedInvite };
    });

    return result;
  }

  async getAllInvites(query: GetAllInvitesQueryDto, user: UserPayloadInterface) {
    const { skip = 0, take = 20, roles, status, search } = query;

    const where: Prisma.InviteWhereInput = {
      companyId: user.companyId,
    };

    if (roles?.length) {
      where.role = { in: roles };
    }

    if (search && search?.length > 0) {
      where.OR = [{ email: { contains: search, mode: 'insensitive' } }];
    }

    if (status?.length) {
      const clauses: Prisma.InviteWhereInput[] = [];
      const now = new Date();

      if (status.includes(InviteStatusesEnum.ACCEPTED)) {
        clauses.push({ acceptedAt: { not: null } });
      }
      if (status.includes(InviteStatusesEnum.REJECTED)) {
        clauses.push({ rejectedAt: { not: null } });
      }
      if (status.includes(InviteStatusesEnum.EXPIRED)) {
        clauses.push({ validUntil: { lt: now }, acceptedAt: null, rejectedAt: null });
      }
      if (status.includes(InviteStatusesEnum.PENDING)) {
        clauses.push({
          validUntil: { gte: now },
          acceptedAt: null,
          rejectedAt: null,
        });
      }
      where.OR = clauses;
    }

    const [total, invites] = await this.prisma.$transaction([
      this.prisma.invite.count({ where }),
      this.prisma.invite.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, invites };
  }

  async rejectInvite(inviteId: string) {
    const invite = await this.getInviteById(inviteId);

    if (!invite) {
      throw new NotFoundException(errorMessages.NotFoundException.INVITE_NOT_FOUND());
    }

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: {
        rejectedAt: dayjs().toDate(),
      },
    });
  }

  async refreshInvite(inviteId: string, user: UserPayloadInterface) {
    // for test swagger set current user company
    // user.companyId = '351a06f8-0828-4214-85d6-a5aff8719df2';
    const invite = await this.findInviteAndAuthorize(inviteId, user.companyId);

    if (!invite.email) {
      throw new BadRequestException(
        errorMessages.BadRequestException.INVITE_CANNOT_REFRESH_NO_EMAIL(),
      );
    }

    const now = new Date();

    const isRejected = invite.rejectedAt !== null;
    const isExpired = !!(
      invite.validUntil &&
      invite.validUntil < now &&
      invite.acceptedAt === null &&
      invite.rejectedAt === null
    );

    if (!isRejected && !isExpired) {
      throw new BadRequestException(errorMessages.BadRequestException.INVITE_CANNOT_REFRESH());
    }

    const usersInCompany = await this.prisma.userCompany.findMany({
      where: {
        companyId: user.companyId,
        user: {
          email: invite.email,
        },
      },
      include: {
        user: { select: { email: true } },
      },
    });

    if (usersInCompany.length > 0) {
      const existingCompanyEmails = usersInCompany.map((uc) => uc.user.email);
      throw new BadRequestException(
        errorMessages.BadRequestException.USERS_ALREADY_IN_COMPANY(existingCompanyEmails),
      );
    }

    const validUntil = dayjs().add(untilExpired, 'hours').toDate();

    const newInvite = await this.prisma.invite.create({
      data: {
        email: invite.email,
        role: invite.role,
        type: invite.type,
        companyId: invite.companyId,
        validUntil,
      },
    });

    await this.schedulerService.scheduleJob(
      newInvite.validUntil,
      SchedulerNamesEnum.REJECT_INVITE,
      { id: newInvite.id },
      SchedulerQueuesEnum.INVITES_QUEUE,
    );

    const existingUser = await this.userService.getUserByEmail(newInvite.email as string);
    const isExisting = Boolean(existingUser);

    const link = `${process.env.APP_CLIENT_URL}/accept-email-invite?inviteId=${newInvite.id}&expiresAt=${validUntil.toISOString()}${isExisting ? '&exist=1' : ''}`;

    const text = isExisting
      ? `Accept invitation to join company. By clicking on the link you agree to this accession: ${link}`
      : `Accept invitation to join company: ${link}`;

    await this.emailService.sendEmail({
      to: newInvite.email!,
      subject: 'Invitation to join company',
      text,
    });

    // delete prev
    await this.prisma.invite.delete({
      where: { id: invite.id },
    });

    return { success: true };
  }

  async remove(id: string, user: UserPayloadInterface) {
    await this.findInviteAndAuthorize(id, user.companyId);

    await this.prisma.invite.delete({
      where: { id },
    });

    return { success: true };
  }

  async getInviteByToken(token: string) {
    return this.prisma.invite.findFirst({
      where: {
        link: {
          contains: token,
        },
        rejectedAt: null,
      },
    });
  }

  private isInviteValid(inviteValidDate: Date) {
    return dayjs(inviteValidDate).isAfter(dayjs());
  }

  private async findInviteAndAuthorize(id: string, companyId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id },
    });

    if (!invite) {
      throw new NotFoundException(errorMessages.NotFoundException.INVITE_NOT_FOUND());
    }

    if (invite.companyId !== companyId) {
      throw new ForbiddenException(errorMessages.ForbiddenException.USER_NOT_ALLOWED());
    }

    return invite;
  }
}
