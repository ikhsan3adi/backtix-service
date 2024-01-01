import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BalanceController } from './balance.controller'
import { BalanceService } from './balance.service'

@Module({
  controllers: [BalanceController],
  providers: [BalanceService, PrismaService],
})
export class BalanceModule {}
