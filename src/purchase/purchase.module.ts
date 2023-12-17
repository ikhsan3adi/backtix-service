import { Module } from '@nestjs/common'
import { PurchaseService } from './purchase.service'
import { PurchaseController } from './purchase.controller'
import { PaymentService } from '../payment/payment.service'
import { PurchaseRepository } from './purchase.repository'
import { TicketModule } from '../ticket/ticket.module'
import { PrismaService } from '../prisma/prisma.service'
import { EventModule } from '../event/event.module'

@Module({
  imports: [TicketModule, EventModule],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    PrismaService,
    PurchaseRepository,
    PaymentService,
  ],
})
export class PurchaseModule {}
