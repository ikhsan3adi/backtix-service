import { ApiProperty } from '@nestjs/swagger'
import { Ticket } from '../../ticket/entities/ticket.entity'

export class TicketOrder {
  constructor(partial: Partial<TicketOrder>) {
    Object.assign(this, partial)
  }

  ticket: Ticket
  transaction: Transaction
}

class Transaction {
  @ApiProperty({ enum: ['paid', 'pending'] })
  status: string
  token?: string
  redirect_url?: string
  error_messages?: string[]
}
