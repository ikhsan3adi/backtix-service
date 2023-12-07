import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { CacheModule } from '@nestjs/cache-manager'
import type { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { config } from './common/config'

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
