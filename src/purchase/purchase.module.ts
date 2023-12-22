import { Module } from '@nestjs/common'
import { EventModule } from '../event/event.module'
import { PaymentService } from '../payment/payment.service'
import { PrismaService } from '../prisma/prisma.service'
import { TicketModule } from '../ticket/ticket.module'
import { PurchaseController } from './purchase.controller'
import { PurchaseRepository } from './purchase.repository'
import { PurchaseService } from './purchase.service'
import { RefundService } from './refund/refund.service'
import { TicketService } from './ticket/ticket.service'

@Module({
  imports: [TicketModule, EventModule],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    PrismaService,
    PurchaseRepository,
    PaymentService,
    RefundService,
    TicketService,
  ],
})
export class PurchaseModule {}
