import { ApiProperty } from '@nestjs/swagger'
import { $Enums } from '@prisma/client'
import { Type } from 'class-transformer'
import { TicketEntity } from '../../ticket/entities/ticket.entity'
import { UserEntity } from '../../user/entities/user.entity'
import { EventImageEntity } from './event-image.entity'

export class EventEntity {
  constructor(partial: Partial<EventEntity>) {
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

  @Type(() => EventImageEntity)
  images?: EventImageEntity[]
  @Type(() => TicketEntity)
  tickets?: TicketEntity[]
  @Type(() => UserEntity)
  user?: UserEntity
}
