import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { BalanceService } from './balance.service'

describe('BalanceService', () => {
  let service: BalanceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile()

    service = module.get<BalanceService>(BalanceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
