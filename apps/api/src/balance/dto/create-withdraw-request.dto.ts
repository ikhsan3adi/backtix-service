import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateWithdrawRequestDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @IsString()
  @IsNotEmpty()
  method: string

  @IsString()
  @IsNotEmpty()
  details: string

  @ApiProperty({ enum: ['BALANCE', 'REVENUE'] })
  @IsString()
  from: 'BALANCE' | 'REVENUE'
}
