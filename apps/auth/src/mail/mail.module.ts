import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { SettingsModule } from '../settings/settings.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SettingsModule, ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
