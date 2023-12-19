import { Type } from 'class-transformer'
import { EventImage } from './event-image.entity'
import { Ticket } from '../../ticket/entities/ticket.entity'

export class Event {
  constructor(partial: Partial<Event>) {
    Object.assign(this, partial)
  }

  id: string
  name: string
  date: Date
  endDate?: Date
  location: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date

  @Type(() => EventImage)
  images?: EventImage[]
  @Type(() => Ticket)
  tickets?: Ticket[]
}
