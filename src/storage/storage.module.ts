import { Module } from '@nestjs/common'
import { LocalStorageService } from './local-storage.service'
import { StorageService } from './storage.service'

@Module({
  providers: [
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
  ],
  exports: [
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
  ],
})
export class StorageModule {}
