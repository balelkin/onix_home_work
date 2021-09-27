import { Injectable } from '@nestjs/common';
import * as Mailgun from 'mailgun-js';
import { ConfigService } from '@nestjs/config';
import { IMailInterface } from './interfaces/mail.interface';


console.log(process.env.MAILGUN_API_KEY);

@Injectable()
export class MailService {
   
  private mg = new Mailgun({ apiKey: '5dc634c759a88e14bfb625b14c99940a-45f7aa85-635ef2a9', domain: 'sandbox9f839483ea9a4bccaa01da5ed7ddd13b.mailgun.org' });

  constructor(private configService: ConfigService) {}

  send(data: IMailInterface): Promise<Mailgun.messages.SendResponse> {
    return new Promise((res, rej) => {
      this.mg.messages().send(data, function (error, body) {
        if (error) {
          rej(error);
        }
        res(body);
      });
    });
  }
}
