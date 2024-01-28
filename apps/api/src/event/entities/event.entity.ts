import { ApiProperty } from '@nestjs/swagger'
import { $Enums } from '@prisma/client'
import { Type } from 'class-transformer'
import { Ticket } from '../../ticket/entities/ticket.entity'
import { UserEntity } from '../../user/entities/user.entity'
import { EventImage } from './event-image.entity'

export class Event {
  constructor(partial: Partial<Event>) {
    Object.assign(this, partial)
  }

  id: string
  name: string
  date: Date
  endDate?: Date
  location: string
  latitude: number
  longitude: number
  description: string
  @ApiProperty({
    enum: $Enums.EventStatus,
    isArray: true,
  })
  status: string
  ticketAvailable?: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date

  @Type(() => EventImage)
  images?: EventImage[]
  @Type(() => Ticket)
  tickets?: Ticket[]
  @Type(() => UserEntity)
  user?: UserEntity
}
