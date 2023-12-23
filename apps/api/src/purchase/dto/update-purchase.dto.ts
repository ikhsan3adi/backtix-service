import { PartialType } from '@nestjs/swagger'
import { CreatePurchaseDto } from './create-ticket-order.dto'

export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {}
