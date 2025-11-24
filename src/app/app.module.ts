import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { LoggerModule } from 'nestjs-pino';
import KeyvRedis from '@keyv/redis';

import { UsersModule } from '@src/users/users.module';
import { HealthModule } from '@src/health/health.module';
import { AuthModule } from '@src/auth/auth.module';
import { CompaniesModule } from '@src/companies/companies.module';
import { UserCompaniesModule } from '@src/user-companies/user-companies.module';
import { UserPrivacyAgreementsModule } from '@src/user-privacy-agreements/user-privacy-agreements.module';
import { PrivacyPoliciesModule } from '@src/privacy-policies/privacy-policies.module';
import { SchedulerModule } from '@src/scheduler/scheduler.module';
import { UsersManagementModule } from '@src/users-management/users-management.module';
import { CommonModule } from '@src/common/common.module';
import { InvitesModule } from '@src/invites/invites.module';
import { MeetingNotesModule } from '@src/meeting-notes/meeting-notes.module';
import { pinoHttpConfig } from '@src/common/utils/logger-config';
import { SummarizationModule } from '@src/summarization/summarization.module';
import { LabelsModule } from '@src/labels/labels.module';
import { UserGroupsModule } from '@src/user-groups/user-groups.module';

import configuration from '../../config/configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
    CacheModule.register({
      stores: [
        new KeyvRedis({
          socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT!,
            tls: process.env.REDIS_TLS !== 'false',
          },
          database: 0,
          password: process.env.REDIS_PASSWORD,
        }),
      ],
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: pinoHttpConfig,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT!,
        db: 0,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    UsersModule,
    HealthModule,
    AuthModule,
    CommonModule,
    CompaniesModule,
    UserCompaniesModule,
    UserPrivacyAgreementsModule,
    PrivacyPoliciesModule,
    InvitesModule,
    SchedulerModule,
    UsersManagementModule,
    MeetingNotesModule,
    SummarizationModule,
    LabelsModule,
    UserGroupsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
