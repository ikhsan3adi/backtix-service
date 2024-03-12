import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { objectStringTransformer } from '../../common/helpers/transformers'
import { PaymentMethod } from '../enums/payment-method.enum'

export class TicketPurchase {
  @IsString()
  @IsNotEmpty()
  ticketId: string

  @IsNumber()
  quantity: number = 1
}

export class CreateTicketOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(64)
  @Transform(objectStringTransformer(TicketPurchase))
  @ValidateNested()
  purchases: TicketPurchase[]

  @ApiProperty({
    enum: [PaymentMethod.direct, PaymentMethod.balance],
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod = PaymentMethod.direct
}
