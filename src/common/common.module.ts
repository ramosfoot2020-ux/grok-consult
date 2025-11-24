import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserCompaniesModule } from '@src/user-companies/user-companies.module';

import { HashService } from './services/hash.service';
import { EmailService } from './services/email.service';
import { TokenService } from './services/token.service';

@Global()
@Module({
  imports: [UserCompaniesModule, JwtModule.register({})],
  providers: [HashService, EmailService, TokenService],
  exports: [HashService, EmailService, TokenService],
})
export class CommonModule {}
