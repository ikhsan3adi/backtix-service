import { OmitType } from '@nestjs/swagger'
import { CreateTicketDto } from './create-ticket.dto'
import { IsNumber } from 'class-validator'

export class UpdateTicketDto extends OmitType(CreateTicketDto, [
  'stock',
] as const) {
  @IsNumber()
  additionalStock?: number = 0
}
