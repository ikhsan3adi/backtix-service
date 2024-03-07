import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'
import { PrismaService } from '../prisma/prisma.service'
import { UserEntity } from '../user/entities/user.entity'
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto'

@Injectable()
export class BalanceService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.perPage = config.pagination.withdrawRequestPerPage
    this.feeKey = config.withdraw.feeKey
  }

  private withdrawalStatuses = ['PENDING', 'COMPLETED', 'REJECTED']
  perPage: number
  feeKey: string

  async myWithdrawals(page: number = 0, user: UserEntity, status: string = '') {
    const s: any = this.withdrawalStatuses.includes(status.toUpperCase())
      ? status.toUpperCase()
      : undefined

    return await this.prismaService.withdrawRequest.findMany({
      where: { userId: user.id, status: s },
      orderBy: { createdAt: 'desc' },
      skip: isNaN(page) ? 0 : page * this.perPage,
      take: this.perPage,
    })
  }

  async requestWithdrawal(
    user: UserEntity,
    createWithdrawRequestDto: CreateWithdrawRequestDto,
  ) {
    const { from, ...withdraw } = createWithdrawRequestDto

    return await this.prismaService.$transaction(async (tx) => {
      const withdrawalFees = await this.getFee()

      const userBalance = await tx.userBalance.findUnique({
        where: { userId: user.id },
        select: { balance: true, revenue: true },
      })

      if (
        (from === 'BALANCE' &&
          userBalance.balance < withdraw.amount + withdrawalFees) ||
        (from === 'REVENUE' &&
          userBalance.revenue < withdraw.amount + withdrawalFees)
      ) {
        throw new BadRequestException(exceptions.WITHDRAW.INSUFFICIENT_BALANCE)
      }

      await tx.userBalance.update({
        where: { userId: user.id },
        data: {
          balance:
            from === 'BALANCE'
              ? { decrement: withdraw.amount + withdrawalFees }
              : undefined,
          revenue:
            from === 'REVENUE'
              ? { decrement: withdraw.amount + withdrawalFees }
              : undefined,
        },
      })

      return await tx.withdrawRequest.create({
        data: {
          ...withdraw,
          fee: withdrawalFees,
          from,
          userId: user.id,
        },
        include: { user: true },
      })
    })
  }

  async withdrawRequests(status: string = '') {
    const s: any = this.withdrawalStatuses.includes(status)
      ? status.toUpperCase()
      : undefined

    return await this.prismaService.withdrawRequest.findMany({
      where: { status: s },
      orderBy: { createdAt: 'desc' },
    })
  }

  private async getFee() {
    const fee = await this.cacheManager.get(this.feeKey)

    if (!fee) {
      const { amount: fee } = await this.prismaService.withdrawFee.findFirst({
        where: { id: 0 },
        select: { amount: true },
      })
      await this.cacheManager.set(this.feeKey, fee)
      return fee
    }

    return Number(fee)
  }
}
