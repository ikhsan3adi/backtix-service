import { Module } from '@nestjs/common'
import { FileController } from './file.controller'
import { FileService } from './file.service'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [StorageModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
