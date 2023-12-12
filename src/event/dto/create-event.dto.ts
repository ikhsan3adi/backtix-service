import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator'
import { CreateEventTicketDto } from './create-event-ticket.dto'
import { Transform } from 'class-transformer'
import {
  dateTimeTransformer,
  objectStringTransformer,
} from '../../common/helpers/transformers'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @Transform(dateTimeTransformer)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  date: string

  @IsString()
  @IsNotEmpty()
  location: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  imageDescriptions: string[]

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @Transform(objectStringTransformer(CreateEventTicketDto))
  @ValidateNested()
  tickets: CreateEventTicketDto[]
}