import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { config } from './common/config'
import { CacheModule } from '@nestjs/cache-manager'
import type { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { FileModule } from './file/file.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ActivationGuard } from './auth/guards/activation.guard'

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: async () =>
        await redisStore({
          socket: {
            host: config.redis.host,
            port: config.redis.port,
          },
          ttl: config.redis.ttl,
        }),
    }),
    AuthModule,
    UserModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActivationGuard,
    },
  ],
})
export class AppModule {}
