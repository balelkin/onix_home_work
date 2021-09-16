import { Injectable } from '@nestjs/common';
import * as mailService from '@sendgrid/mail';
import { IMailInterface } from './interfaces/mail.interface';


@Injectable()
export class MailService {
  
  async sendEmail(emailData: IMailInterface) {
    mailService.setApiKey(process.env.client_secret);
             
    const msg = {
      from: 'balelkinn@gmail.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };
        
    mailService.send(msg).then((res) => {
      console.log('res: ', res);
    }).catch((err) => {
      console.log('err: ', JSON.stringify(err));
    });
  }
}
