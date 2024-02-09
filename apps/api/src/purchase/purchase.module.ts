import { Module, forwardRef } from '@nestjs/common'
import { EventModule } from '../event/event.module'
import { EventRepository } from '../event/event.repository'
import { PaymentService } from '../payment/payment.service'
import { PrismaService } from '../prisma/prisma.service'
import { TicketModule } from '../ticket/ticket.module'
import { PurchaseEventService } from './event/event.service'
import { PurchaseController } from './purchase.controller'
import { PurchaseRepository } from './purchase.repository'
import { PurchaseService } from './purchase.service'
import { PurchaseRefundService } from './refund/refund.service'
import { PurchaseTicketService } from './ticket/ticket.service'

@Module({
  imports: [TicketModule, forwardRef(() => EventModule)],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    PrismaService,
    PurchaseRepository,
    PaymentService,
    PurchaseRefundService,
    PurchaseTicketService,
    PurchaseEventService,
    EventRepository,
  ],
  exports: [PurchaseEventService],
})
export class PurchaseModule {}
