import { Controller, Get, Param, StreamableFile } from '@nestjs/common'
import { FileService } from './file.service'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @ApiOperation({
    summary: 'Stream uploaded file',
  })
  @ApiProduces('application/octet-stream')
  @Get(':path(*)')
  getUploadedFile(@Param('path') path: string): StreamableFile {
    return this.fileService.getUploadedFile(path)
  }
}
