import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Transform } from 'class-transformer'
import {
  dateTimeTransformer,
  objectStringTransformer,
} from '../../common/helpers/transformers'
import { ApiProperty } from '@nestjs/swagger'
import { CreateTicketDto } from '../../ticket/dto/create-ticket.dto'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @Transform(dateTimeTransformer)
  @IsDateString({ strict: true })
  @IsNotEmpty()
  date: string

  @ValidateIf((_, v) => v)
  @Transform(dateTimeTransformer)
  @IsDateString({ strict: true })
  endDate?: string

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
