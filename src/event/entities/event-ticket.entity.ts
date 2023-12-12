import { Exclude, Transform } from 'class-transformer'
import { config } from '../../common/config'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'
import { ApiHideProperty } from '@nestjs/swagger'

export class EventTicket {
  constructor(partial: Partial<EventTicket>) {
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
}
