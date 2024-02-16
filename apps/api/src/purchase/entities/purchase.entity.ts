import { ApiProperty } from '@nestjs/swagger'
import { $Enums } from '@prisma/client'
import { Type } from 'class-transformer'
import { TicketEntity } from '../../ticket/entities/ticket.entity'
import { UserEntity } from '../../user/entities/user.entity'

export class PurchaseEntity {
  constructor(partial: Partial<PurchaseEntity>) {
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

  @Type(() => TicketEntity)
  ticket: TicketEntity

  @Type(() => UserEntity)
  user: UserEntity
}
