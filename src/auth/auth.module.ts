import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../user/user.module'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtModule } from '@nestjs/jwt'
import { config } from '../common/config'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PasswordService } from './password.service'
import { MailModule } from '../mail/mail.module'
import { OtpService } from './otp.service'
import { GoogleStrategy } from './strategies/google.strategy'

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: config.security.accessTokenKey,
      signOptions: { expiresIn: config.security.accessTokenExpiration },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    OtpService,
  ],
})
export class AuthModule {}
