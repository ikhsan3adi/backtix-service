import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'
import { PurchaseRefundService } from './refund.service'

describe('RefundService', () => {
  let service: PurchaseRefundService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRefundService,
        { provide: PurchaseService, useValue: {} },
        { provide: PurchaseRepository, useValue: {} },
      ],
    }).compile()

    service = module.get<PurchaseRefundService>(PurchaseRefundService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
