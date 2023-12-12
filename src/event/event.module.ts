import { Module } from '@nestjs/common'
import { EventController } from './event.controller'
import { EventService } from './event.service'
import { PrismaService } from '../prisma/prisma.service'
import { EventRepository } from './event.repository'
import { StorageModule } from '../storage/storage.module'
import { FileModule } from '../file/file.module'

@Module({
  imports: [StorageModule, FileModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, PrismaService],
})
export class EventModule {}
