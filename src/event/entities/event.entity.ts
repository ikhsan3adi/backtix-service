import { Type } from 'class-transformer'
import { EventImage } from './event-image.entity'
import { EventTicket } from './event-ticket.entity'

export class Event {
  constructor(partial: Partial<Event>) {
    Object.assign(this, partial)
  }

  id: string
  name: string
  date: Date
  location: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date

  @Type(() => EventImage)
  images: EventImage[]
  @Type(() => EventTicket)
  tickets: EventTicket[]
}
