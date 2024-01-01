import { ApiProperty } from '@nestjs/swagger'
import { $Enums } from '@prisma/client'
import { Ticket } from '../../ticket/entities/ticket.entity'
import { Type } from 'class-transformer'

export class Purchase {
  constructor(partial: Partial<Purchase>) {
    Object.assign(this, partial)
  }

  uid: string
  ticketId: string
  userId: string
  orderId: string
  price: number

  @ApiProperty({
    enum: $Enums.PurchaseStatus,
  })
  status: string

  @ApiProperty({
    enum: $Enums.PurchaseRefundStatus,
  })
  refundStatus: string

  used: boolean

  createdAt: Date
  updatedAt: Date
  deletedAt: Date

  @Type(() => Ticket)
  ticket: Ticket
}
