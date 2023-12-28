import { Controller, Get, Param, StreamableFile } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../auth/decorators/public.decorator'
import { FileService } from './file.service'

@ApiBearerAuth()
@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Public()
  @ApiOperation({
    summary: 'Stream uploaded file',
  })
  @ApiProduces('application/octet-stream')
  @Get(':path(*)')
  getUploadedFile(@Param('path') path: string): StreamableFile {
    return this.fileService.getUploadedFile(path)
  }
}
