import { Exclude, Transform } from 'class-transformer'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'
import { config } from '../../common/config'
import { ApiHideProperty } from '@nestjs/swagger'

export class EventImage {
  constructor(partial: Partial<EventImage>) {
    Object.assign(this, partial)
  }

  @ApiHideProperty()
  @Exclude()
  eventId: string

  id: number
  description: string

  @Transform(getFullFileUrlTransformer(config.fileStream.eventImageUrlPath))
  image: string
}
