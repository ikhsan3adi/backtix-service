import { config } from './common/config'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { CacheModule } from '@nestjs/cache-manager'
import { MulterModule } from '@nestjs/platform-express'
import type { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'
import { LoggerMiddleware } from './common/utils/logger'

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { GroupsGuard } from './auth/guards/groups.guard'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { FileModule } from './file/file.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { EventModule } from './event/event.module'
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
        }),
    }),
    MulterModule.register(),
    AuthModule,
    UserModule,
    EventModule,
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
    {
      provide: APP_GUARD,
      useClass: GroupsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
