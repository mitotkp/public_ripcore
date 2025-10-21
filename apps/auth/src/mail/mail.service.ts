import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
//import { User } from '../../../../auth/src/users/user.entity';
import { User } from '../users/user.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async sendWelcomeEmail(user: User) {
    const appNameSetting = await this.settingsService.findOne('app_name');

    await this.transporter.sendMail({
      to: user.email,
      subject: `Bienvenido a ${appNameSetting.value}`,
      html: `<h1>Gracias por registrarte en ${appNameSetting.value}</h1>`,
    });
  }

  async sendPasswordResetEmail(user: User, token: string) {
    const resetLink = `http://localhost:7575/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('mail.from'),
      to: user.email,
      subject: 'Recuperación de contraseña para RipCore',
      html: `
        <p>Hola ${user.name},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 10 minutos.</p>
        <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        `,
    });
  }
}
