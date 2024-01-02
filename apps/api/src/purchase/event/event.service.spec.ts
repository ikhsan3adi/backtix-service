import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseEventService } from './event.service'

describe('EventService', () => {
  let service: PurchaseEventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseEventService,
        { provide: PurchaseRepository, useValue: {} },
      ],
    }).compile()

    service = module.get<PurchaseEventService>(PurchaseEventService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
