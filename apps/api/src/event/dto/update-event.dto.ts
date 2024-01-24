import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator'
import { objectStringTransformer } from '../../common/helpers/transformers'
import { CreateEventDto } from './create-event.dto'
import { UpdateEventImageDto } from './update-event-image.dto'

export class UpdateEventDto extends OmitType(CreateEventDto, [
  'tickets',
  'imageDescriptions',
] as const) {
  @IsArray()
  @ArrayMaxSize(64)
  @Transform(objectStringTransformer(UpdateEventImageDto))
  @ValidateNested()
  images: UpdateEventImageDto[] = []

  @ApiProperty({
    description: 'List of event image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  event: any[]
}
