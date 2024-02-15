import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'
import { config } from '../../common/config'
import { getFullFileUrlTransformer } from '../../common/helpers/transformers'

export class EventImageEntity {
  constructor(partial: Partial<EventImageEntity>) {
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
