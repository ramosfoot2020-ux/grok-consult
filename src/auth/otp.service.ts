import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { randomInt } from 'crypto';

import { Cache } from 'cache-manager';

import { EmailService } from '@src/common/services/email.service';
import { UsersService } from '@src/users/users.service';
import { errorMessages } from '@src/common/error-messages';

@Injectable()
export class OtpService {
  constructor(
    private readonly emailService: EmailService,
    private readonly userService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async sendOtp(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException(errorMessages.NotFoundException.USER_NOT_FOUND());
    }

    const otp = this.generateOtp();

    await this.cacheManager.set(email, otp, 600000);

    await this.emailService.sendEmail({
      to: email,
      subject: 'Your OTP',
      text: `Your OTP is ${otp}`,
    });

    return { success: true };
  }

  async verifyOtp(email: string, otp: string) {
    const isOTPValid = await this.compareOTP(email, otp);

    return { success: isOTPValid };
  }

  private async compareOTP(email: string, otp: string) {
    const otpFromRedis = await this.cacheManager.get(email);

    if (!otpFromRedis) return false;

    return otpFromRedis === otp;
  }

  private generateOtp() {
    return randomInt(1000, 9999).toString();
  }
}
