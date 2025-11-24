import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bull';

import { dateToDelay } from '@src/common/utils/date-to-delay';

import { SchedulerQueuesEnum } from './enums/scheduler-queues.enum';
import { SchedulerNamesEnum } from './enums/scheduler-names.enum';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue(SchedulerQueuesEnum.INVITES_QUEUE)
    private readonly invitesQueue: Queue,
  ) {}

  async scheduleJob(date: Date, name: SchedulerNamesEnum, data: any, queue: SchedulerQueuesEnum) {
    const job = await this[queue].add(name, data, {
      removeOnComplete: true,
      delay: dateToDelay(date),
    });

    return job;
  }

  async deleteJob(jobId: string, queue: SchedulerQueuesEnum) {
    const job = await this[queue].getJob(jobId);

    if (job) {
      await job.remove();
    }
  }
}
