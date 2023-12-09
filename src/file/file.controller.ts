import { Controller, Get, Param, StreamableFile } from '@nestjs/common'
import { FileService } from './file.service'

@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get(':path(*)')
  getUploadedFile(@Param('path') path: string): StreamableFile {
    return this.fileService.getUploadedFile(path)
  }
}
