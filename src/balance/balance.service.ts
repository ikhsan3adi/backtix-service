import { BadRequestException, Injectable } from '@nestjs/common'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'
import { PrismaService } from '../prisma/prisma.service'
import { UserEntity } from '../user/entities/user.entity'
import { CreateWithdrawRequestDto } from './dto/create-withdraw-request.dto'

@Injectable()
export class BalanceService {
  constructor(private prismaService: PrismaService) {
    this.withdrawalFees = config.payment.withdrawalFees
  }

  private withdrawalFees: number

  private withdrawalStatuses = ['PENDING', 'COMPLETED', 'REJECTED']

  async myWithdrawals(user: UserEntity, status: string) {
    const s: any = this.withdrawalStatuses.includes(status.toUpperCase())
      ? status.toUpperCase()
      : undefined

    return await this.prismaService.withdrawRequest.findMany({
      where: { userId: user.id, status: s },
      orderBy: { createdAt: 'desc' },
    })
  }

  async requestWithdrawal(
    user: UserEntity,
    createWithdrawRequestDto: CreateWithdrawRequestDto,
  ) {
    const { from, ...withdraw } = createWithdrawRequestDto

    return await this.prismaService.$transaction(async (tx) => {
      const userBalance = await tx.userBalance.findUnique({
        where: { userId: user.id },
        select: { balance: true, revenue: true },
      })

      if (
        (from === 'balance' &&
          userBalance.balance < withdraw.amount + this.withdrawalFees) ||
        (from === 'revenue' &&
          userBalance.revenue < withdraw.amount + this.withdrawalFees)
      ) {
        throw new BadRequestException(exceptions.WITHDRAW.INSUFFICIENT_BALANCE)
      }

      await tx.userBalance.update({
        where: { userId: user.id },
        data: {
          balance:
            from === 'balance'
              ? { decrement: withdraw.amount + this.withdrawalFees }
              : undefined,
          revenue:
            from === 'revenue'
              ? { decrement: withdraw.amount + this.withdrawalFees }
              : undefined,
        },
      })

      return await tx.withdrawRequest.create({
        data: { ...withdraw, userId: user.id },
        include: { user: true },
      })
    })
  }

  async withdrawRequests(status: string) {
    const s: any = this.withdrawalStatuses.includes(status)
      ? status.toUpperCase()
      : undefined

    return await this.prismaService.withdrawRequest.findMany({
      where: { status: s },
      orderBy: { createdAt: 'desc' },
    })
  }
}
