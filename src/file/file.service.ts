import { Injectable, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { join } from 'path'
import { config } from '../common/config'

@Injectable()
export class FileService {
  getUploadedFile(path: string): StreamableFile {
    const file = createReadStream(join(config.storage.uploadsPath, path))
    return new StreamableFile(file)
  }
}
