import { PartialType } from '@nestjs/swagger'
import { CreateTicketOrderDto } from './create-ticket-order.dto'

export class UpdatePurchaseDto extends PartialType(CreateTicketOrderDto) {}
