import { CacheModule } from '@nestjs/cache-manager'
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { MulterModule } from '@nestjs/platform-express'
import { redisStore } from 'cache-manager-redis-yet'
import type { RedisClientOptions } from 'redis'
import { config } from './common/config'
import { LoggerMiddleware } from './common/utils/logger'

import { GroupsGuard } from './auth/guards/groups.guard'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { AuthModule } from './auth/auth.module'
import { ActivationGuard } from './auth/guards/activation.guard'
import { BalanceModule } from './balance/balance.module'
import { EventModule } from './event/event.module'
import { FileModule } from './file/file.module'
import { MailModule } from './mail/mail.module'
import { PaymentService } from './payment/payment.service'
import { PurchaseModule } from './purchase/purchase.module'
import { TicketModule } from './ticket/ticket.module'
import { UserModule } from './user/user.module'
import { NotificationsModule } from './notifications/notifications.module'

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
    MailModule,
    TicketModule,
    PurchaseModule,
    BalanceModule,
    NotificationsModule,
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
    PaymentService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
