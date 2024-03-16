import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { exceptions } from '../../common/exceptions/exceptions'
import { EventRepository } from '../../event/event.repository'
import { NotificationsService } from '../../notifications/notifications.service'
import { UserEntity } from '../../user/entities/user.entity'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'

@Injectable()
export class PurchaseRefundService {
  constructor(
    private purchaseRepository: PurchaseRepository,
    private purchaseService: PurchaseService,
    private eventRepository: EventRepository,
    private notificationsService: NotificationsService,
  ) {}

  async refundTicketOrder(user: UserEntity, uid: string, eventId: string) {
    if (!eventId) throw new BadRequestException()

    const purchase = await this.purchaseRepository.findOne({
      where: {
        uid,
        userId: user.id,
        refundStatus: null,
        status: 'COMPLETED',
        used: false,
      },
      include: { user: true },
    })

    if (!purchase) throw new NotFoundException(exceptions.PURCHASE.NOT_FOUND)

    try {
      const [updatedPurchase, { userId }] = await Promise.all([
        this.purchaseRepository.update({
          where: { uid },
          data: { refundStatus: 'REFUNDING' },
          include: { ticket: true },
        }),
        this.eventRepository.findOne({ where: { id: eventId } }),
      ])
      /// send notification to event owner
      this.notificationsService.createNotification({
        userId,
        message: `User @${purchase.user.username} requests a ticket refund. Ticket: "${updatedPurchase.ticket.name}"`,
        type: 'TICKET_REFUND_REQUEST',
        entityType: 'EVENT',
        entityId: updatedPurchase.ticket.eventId,
      })
      return updatedPurchase
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

        await Promise.all([
          tx.ticket.update({
            where: { id: purchase.ticketId },
            data: { currentStock: { increment: 1 } },
          }),
          tx.userBalance.update({
            where: { userId: applicantUserId },
            data: { balance: { increment: purchase.price } },
          }),
        ])
        /// send notification to buyer
        this.notificationsService.createNotification({
          userId: applicantUserId,
          message: `(Approved) Ticket refund request "${purchase.ticket.name}". Price: ${purchase.price} ${purchase.refundStatus}`,
          type: 'TICKET_REFUND_STATUS',
          entityType: 'EVENT',
          entityId: purchase.ticket.eventId,
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

        /// send notification to buyer
        this.notificationsService.createNotification({
          userId: applicantUserId,
          message: `(Rejected) Ticket refund request "${purchase.ticket.name}". Price: ${purchase.price} ${purchase.refundStatus}`,
          type: 'TICKET_REFUND_STATUS',
          entityType: 'EVENT',
          entityId: purchase.ticket.eventId,
        })

        return purchase
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      console.error(e)
      throw new InternalServerErrorException()
    }
  }
}
