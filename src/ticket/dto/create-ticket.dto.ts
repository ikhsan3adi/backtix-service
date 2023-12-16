import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { dateTimeTransformer } from '../../common/helpers/transformers'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

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

  @Transform(dateTimeTransformer)
  @IsDateString()
  salesOpenDate: string

  @Transform(dateTimeTransformer)
  @IsDateString()
  purchaseDeadline: string
}
