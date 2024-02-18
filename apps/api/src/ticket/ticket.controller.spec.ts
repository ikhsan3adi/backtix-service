import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseTicketService } from '../purchase/ticket/ticket.service'
import { TicketController } from './ticket.controller'
import { TicketService } from './ticket.service'

describe('TicketController', () => {
  let controller: TicketController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        { provide: TicketService, useValue: {} },
        { provide: PurchaseTicketService, useValue: {} },
      ],
    }).compile()

    controller = module.get<TicketController>(TicketController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
