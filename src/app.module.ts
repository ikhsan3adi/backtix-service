import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { CacheModule } from '@nestjs/cache-manager'
import type { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'

@Module({
  imports: [
    AuthModule,
    UserModule,
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
