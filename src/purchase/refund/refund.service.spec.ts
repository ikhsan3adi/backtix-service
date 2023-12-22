import { Test, TestingModule } from '@nestjs/testing'
import { RefundService } from './refund.service'

describe('RefundService', () => {
  let service: RefundService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefundService],
    }).compile()

    service = module.get<RefundService>(RefundService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
