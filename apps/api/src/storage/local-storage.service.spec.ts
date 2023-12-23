import { Test, TestingModule } from '@nestjs/testing'
import { LocalStorageService } from './local-storage.service'

describe('StorageService', () => {
  let service: LocalStorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStorageService],
    }).compile()

    service = module.get<LocalStorageService>(LocalStorageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
