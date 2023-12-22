import { Test, TestingModule } from '@nestjs/testing'
import { StorageModule } from '../storage/storage.module'
import { FileController } from './file.controller'
import { FileService } from './file.service'

describe('FileController', () => {
  let controller: FileController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
      controllers: [FileController],
      providers: [FileService],
    }).compile()

    controller = module.get<FileController>(FileController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
