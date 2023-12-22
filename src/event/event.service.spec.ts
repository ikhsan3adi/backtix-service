import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { EventRepository } from './event.repository'
import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: StorageService, useValue: {} },
      ],
    }).compile()

    service = module.get<EventService>(EventService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
