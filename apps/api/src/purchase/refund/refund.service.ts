import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common'
import { UserEntity } from '../../user/entities/user.entity'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'

@Injectable()
export class PurchaseRefundService {
  constructor(
    private purchaseRepository: PurchaseRepository,
    private purchaseService: PurchaseService,
  ) {}

  async refundTicketOrder(user: UserEntity, uid: string) {
    try {
      return await this.purchaseRepository.update({
        where: { uid, userId: user.id, refundStatus: null },
        data: { refundStatus: 'REFUNDING' },
        include: { ticket: true },
      })
    } catch (e) {
      console.error(e)
      throw new InternalServerErrorException(e)
    }
  }

  async acceptTicketRefund(user: UserEntity, uid: string) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        await this.purchaseService.verifyEventOwnerByTicketPurchase(user, uid)

        const { userId: applicantUserId } = await tx.purchase.findUnique({
          where: { uid },
          select: { userId: true },
        })

        const purchase = await tx.purchase.update({
          where: {
            uid,
            userId: applicantUserId,
            refundStatus: { not: 'REFUNDED' },
          },
          data: { refundStatus: 'REFUNDED', status: 'CANCELLED' },
          include: { ticket: true },
        })

        if (!purchase) throw new NotAcceptableException()

        await tx.ticket.update({
          where: { id: purchase.ticketId },
          data: { currentStock: { increment: 1 } },
        })

        await tx.userBalance.update({
          where: { userId: applicantUserId },
          data: { balance: { increment: purchase.price } },
        })

        return purchase
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      console.error(e)
      throw new InternalServerErrorException()
    }
  }

  async rejectTicketRefund(user: UserEntity, uid: string) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        await this.purchaseService.verifyEventOwnerByTicketPurchase(user, uid)

        const { userId: applicantUserId } = await tx.purchase.findUnique({
          where: { uid },
          select: { userId: true },
        })

        const purchase = await tx.purchase.update({
          where: { uid, userId: applicantUserId, refundStatus: 'REFUNDING' },
          data: { refundStatus: 'DENIED' },
          include: { ticket: true },
        })
        if (!purchase) throw new NotAcceptableException()
        return purchase
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      console.error(e)
      throw new InternalServerErrorException()
    }
  }
}
