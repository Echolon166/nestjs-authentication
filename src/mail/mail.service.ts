import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { verificationEmail } from './mail.constants';

interface ISendMail {
  to: string;
  subject: string;
  message: string;
}

@Injectable()
export class MailService {
  transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.GOOGLE_MAIL_APP_EMAIL,
      pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
    },
  });

  async send({ to, subject, message }: ISendMail) {
    const mailOptions = {
      from: process.env.GOOGLE_MAIL_APP_EMAIL,
      to: to,
      subject: subject,
      html: message,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerification(
    username: string,
    email: string,
    verificationToken: string,
  ) {
    await this.send({
      to: email,
      subject: 'Email verification',
      message: verificationEmail(username, verificationToken),
    });
  }
}
