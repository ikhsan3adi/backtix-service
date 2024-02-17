import { Type } from 'class-transformer'
import { TicketEntity } from '../../ticket/entities/ticket.entity'
import { PurchaseEntity } from './purchase.entity'

export class TicketWithPurchasesEntity {
  constructor(partial: Partial<TicketWithPurchasesEntity>) {
    Object.assign(this, partial)
  }

  @Type(() => TicketEntity)
  ticket: TicketEntity

  @Type(() => PurchaseEntity)
  purchases: PurchaseEntity[]
}
