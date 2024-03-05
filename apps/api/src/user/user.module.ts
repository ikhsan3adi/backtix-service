import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { OtpService } from '../auth/otp.service'
import { MailModule } from '../mail/mail.module'
import { PrismaService } from '../prisma/prisma.service'
import { StorageModule } from '../storage/storage.module'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  imports: [forwardRef(() => AuthModule), StorageModule, MailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, OtpService],
  exports: [UserService],
})
export class UserModule {}
