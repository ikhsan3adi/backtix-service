import { Test, TestingModule } from '@nestjs/testing'
import { EventRepository } from '../../event/event.repository'
import { TicketRepository } from '../../ticket/ticket.repository'
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
        { provide: EventRepository, useValue: {} },
        { provide: TicketRepository, useValue: {} },
      ],
    }).compile()

    service = module.get<PurchaseTicketService>(PurchaseTicketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
