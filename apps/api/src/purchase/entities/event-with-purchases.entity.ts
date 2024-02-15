import { Type } from 'class-transformer'
import { EventEntity } from '../../event/entities/event.entity'
import { PurchaseEntity } from './purchase.entity'

export class EventWithPurchasesEntity {
  constructor(partial: Partial<EventWithPurchasesEntity>) {
    Object.assign(this, partial)
  }

  @Type(() => EventEntity)
  event: EventEntity

  @Type(() => PurchaseEntity)
  purchases: PurchaseEntity[]
}
