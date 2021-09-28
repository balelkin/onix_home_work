import { Injectable } from '@nestjs/common';
import * as mailService from '@sendgrid/mail';
import { IMailInterface } from './interfaces/mail.interface';

@Injectable()
export class MailService {
  async sendEmail(emailData: IMailInterface) {
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      from: process.env.SENDER_EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };
    await mailService.send(msg);
  }
}
