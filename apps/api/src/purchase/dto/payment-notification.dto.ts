import { IsNotEmpty, IsString } from 'class-validator'

export class PaymentNotificationDto {
  @IsString()
  @IsNotEmpty()
  order_id: string
  @IsString()
  @IsNotEmpty()
  transaction_status: string
  @IsString()
  fraud_status: string = 'accept'
  @IsString()
  @IsNotEmpty()
  gross_amount: string
  @IsString()
  @IsNotEmpty()
  signature_key: string
  @IsString()
  @IsNotEmpty()
  status_code: string

  custom_field1?: number | string
}
