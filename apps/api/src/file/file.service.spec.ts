import { Test, TestingModule } from '@nestjs/testing'
import { StorageModule } from '../storage/storage.module'
import { FileService } from './file.service'

describe('FileService', () => {
  let service: FileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
      providers: [FileService],
    }).compile()

    service = module.get<FileService>(FileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
