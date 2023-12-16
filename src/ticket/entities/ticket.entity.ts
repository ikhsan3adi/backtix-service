import { Exclude, Transform, Type } from 'class-transformer'
import { config } from '../../common/config'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'
import { ApiHideProperty } from '@nestjs/swagger'
import { Event } from '../../event/entities/event.entity'

export class Ticket {
  constructor(partial: Partial<Ticket>) {
    Object.assign(this, partial)
  }

  @ApiHideProperty()
  @Exclude()
  eventId: string

  id: string
  name: string
  price: number
  stock: number

  @Transform(getFullFileUrlTransformer(config.fileStream.ticketImageUrlPath))
  image: string

  salesOpenDate: Date
  purchaseDeadline: Date
  createdAt: Date
  updatedAt: Date

  @Type(() => Event)
  event?: Event
}
