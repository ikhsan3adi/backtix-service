import { Module } from '@nestjs/common'
import { TicketService } from './ticket.service'
import { TicketController } from './ticket.controller'
import { PrismaService } from '../prisma/prisma.service'
import { TicketRepository } from './ticket.repository'
import { StorageModule } from '../storage/storage.module'
import { EventModule } from '../event/event.module'

@Module({
  imports: [StorageModule, EventModule],
  controllers: [TicketController],
  providers: [TicketService, PrismaService, TicketRepository],
  exports: [TicketService],
})
export class TicketModule {}
