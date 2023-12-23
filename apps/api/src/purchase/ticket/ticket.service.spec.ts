import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'
import { TicketService } from './ticket.service'

describe('TicketService', () => {
  let service: TicketService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PurchaseService, useValue: {} },
        { provide: PurchaseRepository, useValue: {} },
      ],
    }).compile()

    service = module.get<TicketService>(TicketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
