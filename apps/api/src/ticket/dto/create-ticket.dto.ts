import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'
import { dateTimeTransformer } from '../../common/helpers/transformers'

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsNumber()
  @IsNotEmpty()
  stock: number

  @ApiProperty({
    description: 'New ticket image',
    type: 'string',
    format: 'binary',
  })
  image?: any

  @IsBoolean()
  hasImage?: boolean = false

  @Transform(dateTimeTransformer)
  @IsDateString()
  salesOpenDate: string

  @Transform(dateTimeTransformer)
  @IsDateString()
  purchaseDeadline: string
}
