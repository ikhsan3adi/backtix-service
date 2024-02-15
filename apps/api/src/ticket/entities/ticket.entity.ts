import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude, Transform, Type } from 'class-transformer'
import { config } from '../../common/config'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'
import { EventEntity } from '../../event/entities/event.entity'

export class TicketEntity {
  constructor(partial: Partial<TicketEntity>) {
    Object.assign(this, partial)
  }

  @ApiHideProperty()
  @Exclude()
  eventId: string

  id: string
  name: string
  price: number
  stock: number
  currentStock: number

  @Transform(getFullFileUrlTransformer(config.fileStream.ticketImageUrlPath))
  image: string

  salesOpenDate: Date
  purchaseDeadline: Date
  createdAt: Date
  updatedAt: Date

  @Type(() => EventEntity)
  event?: EventEntity
}
