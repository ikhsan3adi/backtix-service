import { OmitType } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'
import { CreateTicketDto } from './create-ticket.dto'

export class UpdateTicketDto extends OmitType(CreateTicketDto, [
  'stock',
  'hasImage',
] as const) {
  @IsNumber()
  additionalStock?: number = 0
}
