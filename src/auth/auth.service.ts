import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import process from 'node:process';

import { Cache } from 'cache-manager';

import { HashService } from '@src/common/services/hash.service';
import { errorMessages } from '@src/common/error-messages';
import { UsersService } from '@src/users/users.service';
import { UserCompaniesService } from '@src/user-companies/user-companies.service';
import { UserPayloadInterface } from '@src/common/interfaces/user-payload.interface';
import { TokenService } from '@src/common/services/token.service';
import { CompaniesService } from '@src/companies/companies.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { RolesEnum } from '@src/users/enums/roles.enum';
import { ChangePasswordDto } from '@src/auth/dto/change-password.dto';
import { EmailService } from '@src/common/services/email.service';
import { WHITELISTED_DOMAINS } from '@src/auth/utils/allowed-domains';

import { AppEnvironment } from '../../config/app-environment';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ChangeCompanyDto } from './dto/change-company.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { OtpService } from './otp.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly userCompaniesService: UserCompaniesService,
    private readonly tokenService: TokenService,
    private readonly companiesService: CompaniesService,
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (!this.isEmailAllowed(registerDto.email)) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.REGISTRATION_EMAIL_NOT_ALLOWED(),
      );
    }

    const isUserExists = await this.usersService.getUserByEmail(registerDto.email);

    if (isUserExists) {
      throw new BadRequestException(
        errorMessages.BadRequestException.USER_WITH_EMAIL_IS_ALREADY_EXISTS(registerDto.email),
      );
    }

    const salt = await this.hashService.generateSalt();
    const hashedPassword = await this.hashService.hashPassword(registerDto.password, salt);

    const user = await this.prisma.$transaction(async (tx) => {
      const newCompany = await this.companiesService.createCompanyRecord(
        {
          name: `${registerDto.firstName}'s Space`,
        },
        tx,
      );

      const user = await this.usersService.createUser(
        {
          salt,
          password: hashedPassword,
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          mainCompanyId: newCompany.id,
        },
        tx,
      );

      await this.userCompaniesService.linkUserToCompany(
        {
          userId: user.id,
          companyId: newCompany.id,
          role: RolesEnum.OWNER,
        },
        tx,
      );

      return user;
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    if (!this.isEmailAllowed(loginDto.email)) {
      throw new ForbiddenException(
        errorMessages.ForbiddenException.REGISTRATION_EMAIL_NOT_ALLOWED(),
      );
    }

    const user = await this.usersService.getUserByEmail(loginDto.email);
    const dummySalt = 'Py6o/NWJSgTm4W7DPQOF0Q==',
      dummyPassword =
        '981c4170bf8ed544090299be70af39c3abb5e2750ed4984612758ababdf313e31238e8c1d1a5187e8fa8adfa4e0843e03893350cb37c3240a1e1220d1b8c5d3c';

    const userPassword = user?.password || dummyPassword;
    const userSalt = user?.salt ? Buffer.from(user.salt) : Buffer.from(dummySalt, 'base64');

    const isPasswordCorrect = await this.hashService.comparePasswords(
      loginDto.password,
      userPassword,
      userSalt,
    );

    if (!user || !isPasswordCorrect) {
      throw new BadRequestException(errorMessages.BadRequestException.INVALID_CREDENTIALS());
    }

    const tokens = await this.tokenService.generateTokens(user);

    await this.tokenService.saveRefreshToken(tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string) {
    const hashedToken = await this.hashService.createRefreshTokenHash(refreshToken);
    const key = `refresh-${hashedToken}`;

    const isExist = await this.cacheManager.get(key);

    if (!isExist) {
      throw new BadRequestException(errorMessages.BadRequestException.INVALID_CREDENTIALS());
    }

    await this.cacheManager.del(key);

    return {
      success: true,
    };
  }

  async refreshToken(refreshToken: string, userId: string) {
    const hashedToken = await this.hashService.createRefreshTokenHash(refreshToken);

    const key = `refresh-${hashedToken}`;

    const matchToken = await this.cacheManager.get(key);

    if (!matchToken) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const tokens = await this.tokenService.generateTokens(user);

    await this.tokenService.saveRefreshToken(tokens.refreshToken);
    await this.cacheManager.del(key);

    return tokens;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { password, otp, email } = dto;

    const verifiedOTP = await this.otpService.verifyOtp(email, otp);

    const generatedSalt = await this.hashService.generateSalt();
    const hashedPassword = await this.hashService.hashPassword(password, generatedSalt);

    if (verifiedOTP.success) {
      await this.usersService.updateUserPassword(email, hashedPassword, generatedSalt);
      await this.cacheManager.del(email);
      await this.emailService.sendEmail({
        to: email,
        subject: 'Auth Notification',
        text: "Password has been changed successfully. If you didn't perform this action, please contact support.",
      });
    }

    return { success: true };
  }

  async setPassword(setPasswordDto: SetPasswordDto, userId: string) {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const salt = await this.hashService.generateSalt();
    const hashedPassword = await this.hashService.hashPassword(setPasswordDto.password, salt);

    await this.usersService.updateUserPassword(user.email, hashedPassword, salt);
    return { success: true };
  }

  async changeCompany(changeCompanyDto: ChangeCompanyDto, user: UserPayloadInterface) {
    const { companyId } = changeCompanyDto;

    const userCompany = await this.userCompaniesService.getUserCompanyByUserIdAndCompanyId(
      user.userId,
      companyId,
    );

    if (!userCompany) {
      throw new BadRequestException(errorMessages.BadRequestException.CANNOT_CHANGE_COMPANY());
    }

    const userInfo = await this.usersService.getUserById(user.userId);

    if (!userInfo) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    return this.tokenService.generateTokens(userInfo, companyId);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { otp, email } = verifyEmailDto;

    const verifiedOTP = await this.otpService.verifyOtp(email, otp);

    if (!verifiedOTP.success) {
      throw new BadRequestException(errorMessages.BadRequestException.INVALID_OTP());
    }

    await this.usersService.verifyUserEmail(email);

    await this.cacheManager.del(email);

    return { success: true };
  }

  async changePassword(dto: ChangePasswordDto, userPayload: UserPayloadInterface) {
    const { oldPassword, newPassword } = dto;
    const { userId } = userPayload;

    const user = await this.usersService.findUserForAuthById(userId);
    if (!user) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const isOldPasswordCorrect = await this.hashService.comparePasswords(
      oldPassword,
      user.password,
      Buffer.from(user.salt),
    );

    if (!isOldPasswordCorrect) {
      throw new BadRequestException('The old password you entered is incorrect.');
    }

    const newSalt = await this.hashService.generateSalt();
    const newHashedPassword = await this.hashService.hashPassword(newPassword, newSalt);

    await this.usersService.updateUserPassword(user.email, newHashedPassword, newSalt);

    return { success: true };
  }

  // temporary dev restriction due no api calla limits adn not implemented subscription plans
  private isEmailAllowed(email: string): boolean {
    if (process.env.NODE_ENV !== AppEnvironment.Production) {
      return true;
    }

    const lowercasedEmail = email.toLowerCase().trim();
    const domain = lowercasedEmail.split('@')[1];

    const whitelistedEmails = (process.env.ACCESS_DEV_EMAILS?.split(',') || []).map((e) =>
      e.trim().toLowerCase(),
    );

    return (
      whitelistedEmails.includes(lowercasedEmail) ||
      (!!domain && WHITELISTED_DOMAINS.includes(domain))
    );
  }
}
