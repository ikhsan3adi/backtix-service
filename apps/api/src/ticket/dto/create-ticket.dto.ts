import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
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
  @Type(() => Number)
  price: number

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
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
  @IsDateString({ strict: true })
  salesOpenDate: string

  @Transform(dateTimeTransformer)
  @IsDateString({ strict: true })
  purchaseDeadline: string = null
}
