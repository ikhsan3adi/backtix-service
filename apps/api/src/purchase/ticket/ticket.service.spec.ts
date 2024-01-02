import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'
import { PurchaseTicketService } from './ticket.service'

describe('TicketService', () => {
  let service: PurchaseTicketService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseTicketService,
        { provide: PurchaseService, useValue: {} },
        { provide: PurchaseRepository, useValue: {} },
      ],
    }).compile()

    service = module.get<PurchaseTicketService>(PurchaseTicketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
