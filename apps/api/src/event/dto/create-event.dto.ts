import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator'
import {
  dateTimeTransformer,
  objectStringTransformer,
} from '../../common/helpers/transformers'
import { CreateTicketDto } from '../../ticket/dto/create-ticket.dto'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @Transform(dateTimeTransformer)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  date: string

  @Transform(dateTimeTransformer)
  @IsDateString({ strict: true })
  endDate: string = null

  @IsString()
  @IsNotEmpty()
  location: string

  @IsLatitude()
  @Type(() => Number)
  latitude: number

  @IsLongitude()
  @Type(() => Number)
  longitude: number

  @IsString()
  @IsNotEmpty()
  description: string

  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  categories: string[]

  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  imageDescriptions: (string | null)[]

  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @Transform(objectStringTransformer(CreateTicketDto))
  @ValidateNested()
  tickets: CreateTicketDto[]

  @ApiProperty({
    description: 'List of event image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  event: any[]

  @ApiProperty({
    description: 'List of ticket image',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  ticket: any[]
}
