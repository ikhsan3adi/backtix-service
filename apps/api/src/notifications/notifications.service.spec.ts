import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from './notifications.service'

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, PrismaService],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
