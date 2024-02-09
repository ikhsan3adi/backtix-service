import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { config } from '../../common/config'
import { exceptions } from '../../common/exceptions/exceptions'
import { EventRepository } from '../../event/event.repository'
import { UserEntity } from '../../user/entities/user.entity'
import { PurchaseRepository } from '../purchase.repository'
import { PurchaseService } from '../purchase.service'

@Injectable()
export class PurchaseTicketService {
  constructor(
    private purchaseRepository: PurchaseRepository,
    private purchaseService: PurchaseService,
    private eventRepository: EventRepository,
  ) {
    this.perPage = config.pagination.eventWithPurchasesPerPage
  }

  purchaseStatuses = ['PENDING', 'COMPLETED', 'CANCELLED']
  refundStatuses = ['REFUNDING', 'REFUNDED', 'DENIED']
  perPage: number

  async myTickets(
    user: UserEntity,
    page: number = 0,
    status?: string | any,
    refundStatus?: string | any,
    used?: boolean,
  ) {
    const s = this.purchaseStatuses.includes(status) ? status : 'COMPLETED'
    const rs = this.refundStatuses.includes(refundStatus)
      ? refundStatus
      : undefined

    const events = await this.eventRepository.findMany({
      where: {
        tickets: {
          some: {
            purchases: {
              some: { userId: user.id, status: s, refundStatus: rs, used },
            },
          },
        },
      },
      include: { images: { take: 1 } },
      skip: page * this.perPage,
      take: this.perPage,
    })

    const purchases = await this.purchaseRepository.findMany({
      where: {
        userId: user.id,
        status: s,
        refundStatus: rs,
        used,
        ticket: { eventId: { in: events.map((e) => e.id) } },
      },
      include: { ticket: true },
    })

    return events.map((event) => ({
      event: event,
      purchases: purchases.filter((e) => e.ticket.eventId === event.id),
    }))
  }

  async myTicket(user: UserEntity, uid: string) {
    const purchase = await this.purchaseRepository.findOne({
      where: { userId: user.id, uid },
      include: {
        ticket: { include: { event: { include: { images: { take: 1 } } } } },
      },
    })
    if (!purchase) throw new NotFoundException(exceptions.PURCHASE.NOT_FOUND)
    return purchase
  }

  async validateTicket(user: UserEntity, uid: string, eventId: string) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        await this.purchaseService.verifyEventOwnerByTicketPurchase(user, uid)

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ticket: _, ...purchase } = await this.checkTicketPurchase(
          tx,
          uid,
          eventId,
        )

        return purchase
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      console.error(e)
      throw new InternalServerErrorException()
    }
  }

  async useTicket(user: UserEntity, uid: string, eventId: string) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        await this.purchaseService.verifyEventOwnerByTicketPurchase(user, uid)

        await this.checkTicketPurchase(tx, uid, eventId)

        return await tx.purchase.update({
          where: { uid },
          data: { used: true },
        })
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      console.error(e)
      throw new InternalServerErrorException()
    }
  }

  private async checkTicketPurchase(
    tx: PrismaClient,
    uid: string,
    eventId: string,
  ) {
    const purchase = await tx.purchase.findUnique({
      where: { uid },
      include: { ticket: { select: { eventId: true } } },
    })

    if (!purchase) {
      throw new NotFoundException(exceptions.PURCHASE.NOT_FOUND)
    } else if (purchase.ticket.eventId !== eventId) {
      throw new NotAcceptableException(exceptions.PURCHASE.INVALID)
    } else if (
      purchase.status !== 'COMPLETED' ||
      purchase.refundStatus === 'REFUNDED'
    ) {
      throw new NotAcceptableException(exceptions.PURCHASE.INVALID)
    } else if (purchase.used) {
      throw new NotAcceptableException(exceptions.PURCHASE.TICKET_USED)
    }

    return purchase
  }
}
