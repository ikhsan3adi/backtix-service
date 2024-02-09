import { Type } from 'class-transformer'
import { Event } from '../../event/entities/event.entity'
import { Purchase } from './purchase.entity'

export class EventWithPurchases {
  constructor(partial: Partial<EventWithPurchases>) {
    Object.assign(this, partial)
  }

  @Type(() => Event)
  event: Event

  @Type(() => Purchase)
  purchases: Purchase[]
}
