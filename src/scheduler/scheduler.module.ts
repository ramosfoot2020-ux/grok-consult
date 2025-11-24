import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { SchedulerService } from './scheduler.service';
import { SchedulerQueuesEnum } from './enums/scheduler-queues.enum';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SchedulerQueuesEnum.INVITES_QUEUE,
    }),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
