import { ApiProperty } from '@nestjs/swagger'
import { IsCurrency, IsNotEmpty, IsString } from 'class-validator'

export class CreateWithdrawRequestDto {
  @IsCurrency()
  @IsNotEmpty()
  amount: number

  @IsString()
  @IsNotEmpty()
  method: string

  @IsString()
  @IsNotEmpty()
  details: string

  @ApiProperty({ enum: ['balance', 'revenue'] })
  @IsString()
  from: 'balance' | 'revenue'
}
