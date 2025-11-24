import { Injectable } from '@nestjs/common';

import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';

import { EmailParamsInterface } from '../interfaces/email-params.interface';

@Injectable()
export class EmailService {
  private readonly ses;

  constructor() {
    this.ses = new SESClient({ region: process.env.AWS_REGION });
  }

  async sendEmail(emailParams: EmailParamsInterface) {
    try {
      const toAddresses = Array.isArray(emailParams.to)
        ? emailParams.to.map((e) => e.trim())
        : [emailParams.to.trim()];

      const paramsPlain: SendEmailCommandInput = {
        Source: process.env.AWS_SES_SOURCE,
        Destination: { ToAddresses: toAddresses },
        Message: {
          Subject: { Data: emailParams.subject || emailParams.text },
          Body: { Text: { Data: emailParams.text } },
        },
      };
      const cmdPlain = new SendEmailCommand(paramsPlain);
      return this.ses.send(cmdPlain);
    } catch (err) {
      console.log('Failed to send email', err);
    }
  }
}
