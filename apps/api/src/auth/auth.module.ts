import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { config } from '../common/config'
import { MailModule } from '../mail/mail.module'
import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthGoogleService } from './google/auth-google.service'
import { OtpService } from './otp.service'
import { PasswordService } from './password.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: config.security.accessTokenKey,
      signOptions: { expiresIn: config.security.accessTokenExpiration },
    }),
    MailModule,
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    OtpService,
    AuthGoogleService,
  ],
})
export class AuthModule {}
