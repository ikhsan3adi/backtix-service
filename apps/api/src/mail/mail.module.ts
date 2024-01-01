import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'
import { config } from '../common/config'

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: config.smtp.host,
        secure: false,
        auth: {
          user: config.smtp.address,
          pass: config.smtp.password,
        },
      },
      defaults: {
        from: `"No Reply" <${config.smtp.from}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
