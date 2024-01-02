import { Module, forwardRef } from '@nestjs/common'
import { FileModule } from '../file/file.module'
import { PrismaService } from '../prisma/prisma.service'
import { PurchaseModule } from '../purchase/purchase.module'
import { StorageModule } from '../storage/storage.module'
import { EventController } from './event.controller'
import { EventRepository } from './event.repository'
import { EventService } from './event.service'

@Module({
  imports: [forwardRef(() => PurchaseModule), StorageModule, FileModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, PrismaService],
  exports: [EventService],
})
export class EventModule {}
