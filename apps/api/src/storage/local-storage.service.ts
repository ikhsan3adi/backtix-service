import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as fs from 'fs'
import { nanoid } from 'nanoid'
import { join } from 'path'
import { exceptions } from '../common/exceptions/exceptions'
import { StorageService } from './storage.service'

@Injectable()
export class LocalStorageService extends StorageService {
  private idGenerator: (size: number) => string

  constructor() {
    super()
    this.idGenerator = nanoid
  }

  checkIfFileOrDirectoryExists(path: string): boolean {
    return fs.existsSync(join(process.cwd(), path))
  }

  async getFile(path: string): Promise<string | Buffer> {
    return fs.readFileSync(join(process.cwd(), path))
  }

  generateRandomFilename(filename: string): string {
    if (!filename) return undefined
    const fileExt = filename.split('.')
    return this.idGenerator(16).concat('.', fileExt[fileExt.length - 1])
  }

  createFile(path: string, filename: string, data: string | Buffer): void {
    if (!data) return
    try {
      if (!this.checkIfFileOrDirectoryExists(path)) {
        fs.mkdirSync(join(process.cwd(), path), { recursive: true })
      }
      fs.writeFileSync(join(process.cwd(), path, filename), data, 'utf8')
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException(exceptions.FILE.UPLOAD_FAILED)
    }
  }

  deleteFile(path: string, filename?: string): void {
    try {
      return fs.unlinkSync(
        filename
          ? join(process.cwd(), path, filename)
          : join(process.cwd(), path),
      )
    } catch (e) {
      console.error(e)
    }
  }
}
