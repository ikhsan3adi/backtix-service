import { Module, forwardRef } from '@nestjs/common'
import { EventModule } from '../event/event.module'
import { PrismaService } from '../prisma/prisma.service'
import { PurchaseModule } from '../purchase/purchase.module'
import { StorageModule } from '../storage/storage.module'
import { TicketController } from './ticket.controller'
import { TicketRepository } from './ticket.repository'
import { TicketService } from './ticket.service'

@Module({
  imports: [
    StorageModule,
    forwardRef(() => EventModule),
    forwardRef(() => PurchaseModule),
  ],
  controllers: [TicketController],
  providers: [TicketService, PrismaService, TicketRepository],
  exports: [TicketService],
})
export class TicketModule {}
