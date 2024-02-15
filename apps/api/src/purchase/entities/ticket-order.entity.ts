import { ApiProperty } from '@nestjs/swagger'
import { TicketEntity } from '../../ticket/entities/ticket.entity'

export class TicketOrderEntity {
  constructor(partial: Partial<TicketOrderEntity>) {
    Object.assign(this, partial)
  }

  tickets: TicketEntity[]
  transaction: Transaction
}

class Transaction {
  @ApiProperty({ enum: ['paid', 'pending'] })
  status: string
  token?: string
  redirect_url?: string
  error_messages?: string[]
}
