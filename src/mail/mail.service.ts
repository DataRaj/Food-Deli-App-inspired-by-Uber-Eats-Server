import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { IMail } from './mail.interface';

@Injectable()
export class MailService {
  constructor(@Inject('MAIL') private readonly params: IMail) {}

  // send email
  async sendMail(
    subject: string,
    to: string,
    template: string,
    email: string,
    code: string,
  ): Promise<any> {
    const form = new FormData();
    form.append(
      'from',
      `MailGun Test <mailgun@${this.params.MAIL_DOMAIN_NAME}>`,
    );
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    form.append('v:email', email);
    form.append('v:code', code);

    const mailApiKey = this.params.MAIL_API_KEY;
    const mailDomainName = this.params.MAIL_DOMAIN_NAME;
    const mailApiUrl = `https://api.mailgun.net/v3/${mailDomainName}/messages`;
    const mailApiHeaders = {
      Authorization: `Basic ${Buffer.from(`api:${mailApiKey}`).toString(
        'base64',
      )}`,
    };

    const mailApiResponse = await axios.post(mailApiUrl, form, {
      headers: mailApiHeaders,
    });
    return mailApiResponse?.data;
  }
  sendVerificationMail(email: string, code: string): Promise<any> {
    return this.sendMail('Verification', email, 'recovery', email, code);
  }
}
