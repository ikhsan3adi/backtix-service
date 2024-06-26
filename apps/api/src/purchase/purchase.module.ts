import { Module, forwardRef } from '@nestjs/common'
import { EventModule } from '../event/event.module'
import { EventRepository } from '../event/event.repository'
import { NotificationsModule } from '../notifications/notifications.module'
import { PaymentService } from '../payment/payment.service'
import { PrismaService } from '../prisma/prisma.service'
import { TicketModule } from '../ticket/ticket.module'
import { TicketRepository } from '../ticket/ticket.repository'
import { PurchaseEventService } from './event/event.service'
import { PurchaseController } from './purchase.controller'
import { PurchaseRepository } from './purchase.repository'
import { PurchaseService } from './purchase.service'
import { PurchaseRefundService } from './refund/refund.service'
import { PurchaseTicketService } from './ticket/ticket.service'

@Module({
  imports: [TicketModule, forwardRef(() => EventModule), NotificationsModule],
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
    TicketRepository,
  ],
  exports: [PurchaseEventService, PurchaseTicketService],
})
export class PurchaseModule {}
