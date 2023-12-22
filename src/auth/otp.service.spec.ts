import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { OtpService } from './otp.service'

describe('OtpService', () => {
  let service: OtpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile()

    service = module.get<OtpService>(OtpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
