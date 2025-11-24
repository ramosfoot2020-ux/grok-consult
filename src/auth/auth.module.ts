import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '@src/users/users.module';
import { UserPrivacyAgreementsModule } from '@src/user-privacy-agreements/user-privacy-agreements.module';
import { UserCompaniesModule } from '@src/user-companies/user-companies.module';
import { CompaniesModule } from '@src/companies/companies.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtUserRefreshStrategy } from './strategies/jwt-refresh-user.strategy';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { OtpService } from './otp.service';

@Module({
  imports: [
    UsersModule,
    UserPrivacyAgreementsModule,
    UserCompaniesModule,
    CompaniesModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtUserRefreshStrategy, JwtUserStrategy, OtpService],
})
export class AuthModule {}
