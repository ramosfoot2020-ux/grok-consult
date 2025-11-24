import { Process, Processor } from '@nestjs/bull';
import { NotFoundException } from '@nestjs/common';

import { Job } from 'bull';

import { SchedulerQueuesEnum } from '@src/scheduler/enums/scheduler-queues.enum';
import { SchedulerNamesEnum } from '@src/scheduler/enums/scheduler-names.enum';
import { errorMessages } from '@src/common/error-messages';

import { InvitesService } from './invites.service';

@Processor(SchedulerQueuesEnum.INVITES_QUEUE)
export class InvitesQueueProcessor {
  constructor(private readonly inviteService: InvitesService) {}

  @Process(SchedulerNamesEnum.REJECT_INVITE)
  async rejectInvite(job: Job) {
    const { id } = job.data;

    const invite = await this.inviteService.getInviteById(id);

    if (!invite) {
      throw new NotFoundException(errorMessages.NotFoundException.INVITE_NOT_FOUND());
    }

    // if (invite.rejectedAt != null || invite.acceptedAt != null) return;

    await this.inviteService.rejectInvite(id);
  }
}
