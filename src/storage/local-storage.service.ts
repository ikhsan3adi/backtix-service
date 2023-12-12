import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { join } from 'path'
import { StorageService } from './storage.service'
import { nanoid } from 'nanoid'

@Injectable()
export class LocalStorageService extends StorageService {
  checkIfFileOrDirectoryExists(path: string): boolean {
    return fs.existsSync(join(process.cwd(), path))
  }

  async getFile(path: string): Promise<string | Buffer> {
    return fs.readFileSync(join(process.cwd(), path))
  }

  async createFile(
    path: string,
    filename: string,
    data: string | Buffer,
  ): Promise<string> {
    if (!this.checkIfFileOrDirectoryExists(path)) {
      fs.mkdirSync(path, { recursive: true })
    }
    const fileExt = filename.split('.')
    const newFilename = nanoid(16).concat('.', fileExt[fileExt.length - 1])

    fs.writeFileSync(join(process.cwd(), path, newFilename), data, 'utf8')
    return newFilename
  }

  deleteFile(path: string, filename?: string): void {
    try {
      return fs.unlinkSync(
        filename
          ? join(process.cwd(), path, filename)
          : join(process.cwd(), path),
      )
    } catch {}
  }
}
