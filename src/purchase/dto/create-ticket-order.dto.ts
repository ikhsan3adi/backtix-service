import { IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator'
import { PaymentMethod } from '../enums/payment-method.enum'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePurchaseDto {
  @IsNumber()
  @ValidateIf((_, v) => v)
  quantity: number = 1

  @ApiProperty({
    enum: [PaymentMethod.direct, PaymentMethod.balance],
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  @ValidateIf((_, v) => v)
  paymentMethod: PaymentMethod = PaymentMethod.direct
}
