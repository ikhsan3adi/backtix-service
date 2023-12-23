import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { MailService } from '../mail/mail.service'
import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { OtpService } from './otp.service'
import { PasswordService } from './password.service'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: PasswordService, useValue: {} },
        { provide: OtpService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
