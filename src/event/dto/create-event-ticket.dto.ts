import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { dateTimeTransformer } from '../../common/helpers/transformers'
import { Transform } from 'class-transformer'

export class CreateEventTicketDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsNumber()
  @IsNotEmpty()
  stock: number

  @Transform(dateTimeTransformer)
  @IsDateString()
  @IsNotEmpty()
  salesOpenDate: string

  @Transform(dateTimeTransformer)
  @IsDateString()
  @IsNotEmpty()
  purchaseDeadline: string
}
