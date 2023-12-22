import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event/event.service'
import { StorageService } from '../storage/storage.service'
import { TicketRepository } from './ticket.repository'
import { TicketService } from './ticket.service'

describe('TicketService', () => {
  let service: TicketService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TicketRepository, useValue: {} },
        { provide: EventService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile()

    service = module.get<TicketService>(TicketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
