import { Ticket } from '../../ticket/entities/ticket.entity'

export class TicketOrder {
  constructor(partial: Partial<TicketOrder>) {
    Object.assign(this, partial)
  }

  ticket: Ticket
  transaction: {
    status: string
    token?: string
    redirect_url?: string
    error_messages?: string[]
  }
}
