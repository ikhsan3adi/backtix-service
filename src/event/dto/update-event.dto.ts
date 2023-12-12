import { OmitType } from '@nestjs/swagger'
import { CreateEventDto } from './create-event.dto'
import { UpdateEventImageDto } from './update-event-image.dto'
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator'
import { Transform } from 'class-transformer'
import { objectStringTransformer } from '../../common/helpers/transformers'

export class UpdateEventDto extends OmitType(CreateEventDto, [
  'tickets',
  'imageDescriptions',
] as const) {
  @IsArray()
  @ArrayMaxSize(64)
  @Transform(objectStringTransformer(UpdateEventImageDto))
  @ValidateNested()
  images: UpdateEventImageDto[]
}
