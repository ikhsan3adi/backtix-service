import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth/auth.service'
import { OtpService } from '../auth/otp.service'
import { PasswordService } from '../auth/password.service'
import { MailService } from '../mail/mail.service'
import { StorageService } from '../storage/storage.service'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserService, useValue: {} },
        { provide: PasswordService, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: StorageService, useValue: {} },
        { provide: OtpService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
