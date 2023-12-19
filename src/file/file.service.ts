import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'
import { config } from '../common/config'
import { StorageService } from '../storage/storage.service'

@Injectable()
export class FileService {
  constructor(private storageService: StorageService) {}

  getUploadedFile(path: string): StreamableFile {
    this.checkFileExists(join(config.storage.uploadsPath, path))

    const file = createReadStream(join(config.storage.uploadsPath, path))
    return new StreamableFile(file)
  }

  checkFileExists(path: string) {
    const fileExist = this.storageService.checkIfFileOrDirectoryExists(path)

    if (!fileExist) throw new NotFoundException('File was not found')
  }
}
