import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'
import { RefundService } from './refund.service'

describe('RefundService', () => {
  let service: RefundService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundService,
        { provide: PurchaseService, useValue: {} },
        { provide: PurchaseRepository, useValue: {} },
      ],
    }).compile()

    service = module.get<RefundService>(RefundService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
