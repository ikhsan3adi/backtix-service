import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { CreatePurchaseDto } from './dto/create-ticket-order.dto'
import { PaymentService } from '../payment/payment.service'
import { UserEntity } from '../user/entities/user.entity'
import { PurchaseRepository } from './purchase.repository'
import { TicketService } from '../ticket/ticket.service'
import { PaymentNotificationDto } from './dto/payment-notification.dto'
import { Prisma, PrismaClient } from '@prisma/client'
import { PaymentMethod } from './enums/payment-method.enum'
import { EventService } from '../event/event.service'
import { nanoid } from 'nanoid'
import { createHash } from 'crypto'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'

@Injectable()
export class PurchaseService {
  constructor(
    private purchaseRepository: PurchaseRepository,
    private paymentService: PaymentService,
    private ticketService: TicketService,
    private eventService: EventService,
  ) {
    this.idGenerator = nanoid
  }

  idGenerator: (size: number) => string

  purchaseStatuses = ['PENDING', 'COMPLETED', 'CANCELLED']
  refundStatuses = ['REFUNDING', 'REFUNDED', 'DENIED']

  async notifyTicketOrder(notification: PaymentNotificationDto) {
    if (!notification) throw new BadRequestException()
    this.compareSignatureKey(notification)

    const orderId = notification.order_id
    const transactionStatus = notification.transaction_status
    const fraudStatus = notification.fraud_status
    const grossAmount = notification.gross_amount
    const balanceUsed = notification.custom_field1

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}. Gross amount: ${grossAmount}. Balance used: ${balanceUsed}`,
    )

    return await this.purchaseRepository.createTransactions(async (tx) => {
      const completeSuccessTicketOrder = async () => {
        return await this.completeSuccessTicketOrder(
          tx,
          orderId,
          balanceUsed
            ? {
                userId: (
                  await tx.purchase.findFirst({
                    where: { orderId },
                    select: { userId: true },
                  })
                ).userId,
                amount: Number(balanceUsed),
              }
            : undefined,
        )
      }

      if (transactionStatus === 'capture' && fraudStatus === 'accept') {
        await completeSuccessTicketOrder()
      } else if (transactionStatus === 'settlement') {
        await completeSuccessTicketOrder()
      } else if (
        transactionStatus === 'cancel' ||
        transactionStatus === 'deny' ||
        transactionStatus === 'expire'
      ) {
        await tx.purchase.updateMany({
          where: { orderId, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        })
      }
      // else if (transactionStatus === 'pending') {
      // }
    })
  }

  async createTicketOrder(
    user: UserEntity,
    ticketId: string,
    createTicketOrderDto: CreatePurchaseDto,
  ) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        const ticket = await this.ticketService.getAndValidateTicket(
          ticketId,
          createTicketOrderDto.quantity,
        )

        const orderId = `BTx-${this.idGenerator(12)}`

        const [{ username: eventOwnerUsername }] = await Promise.all([
          tx.user.findUnique({
            where: { id: ticket.event.userId },
            select: { username: true },
          }),
          tx.purchase.createMany({
            data: Array.from(
              { length: createTicketOrderDto.quantity },
              (): Prisma.PurchaseCreateManyInput => ({
                orderId,
                ticketId,
                price: ticket.price,
                status: 'PENDING',
                userId: user.id,
              }),
            ),
          }),
        ])

        const customerFullnameSplitted = user.fullname.split(' ')

        let TOTAL_PRICE = ticket.price * createTicketOrderDto.quantity
        let REBATE = 0

        if (createTicketOrderDto.paymentMethod === PaymentMethod.balance) {
          const { balance: userBalance } =
            await tx.userBalance.findUniqueOrThrow({
              where: { userId: user.id },
              select: { balance: true },
            })

          if (userBalance >= TOTAL_PRICE) {
            await this.completeSuccessTicketOrder(tx, orderId, {
              userId: user.id,
              amount: TOTAL_PRICE,
            })
            return { ticket, transaction: { status: 'paid' } }
          }

          REBATE = userBalance
          TOTAL_PRICE -= REBATE
        }

        const item_details = [
          {
            id: ticketId,
            name: `${ticket.name} | ${ticket.event.name}`,
            merchant_name: eventOwnerUsername,
            price: ticket.price,
            quantity: createTicketOrderDto.quantity,
          },
        ]

        if (REBATE > 0) {
          item_details.push({
            id: `${ticketId}-${user.username}_REBATE`,
            name: 'rebate from the balance',
            merchant_name: eventOwnerUsername,
            price: -REBATE,
            quantity: 1,
          })
        }

        const transaction = await this.paymentService.createTransaction({
          transaction_details: {
            order_id: orderId,
            gross_amount: TOTAL_PRICE,
          },
          item_details,
          customer_details: {
            email: user.email,
            first_name: customerFullnameSplitted.shift(),
            last_name: customerFullnameSplitted.join(' '),
          },
          credit_card: { secure: true },
          custom_field1: REBATE,
        })

        return { ticket, transaction: { ...transaction, status: 'pending' } }
      })
    } catch (e) {
      if (e instanceof HttpException) throw e
      console.error(e)
      throw new InternalServerErrorException()
    }
  }

  async myTickets(
    user: UserEntity,
    status?: string | any,
    refundStatus?: string | any,
    used?: boolean,
  ) {
    const s = this.purchaseStatuses.includes(status) ? status : 'COMPLETED'
    const rs = this.refundStatuses.includes(refundStatus)
      ? refundStatus
      : undefined

    return await this.purchaseRepository.findMany({
      where: { userId: user.id, status: s, refundStatus: rs, used },
      include: {
        ticket: {
          include: {
            event: {
              include: { images: { take: 1 } },
            },
          },
        },
      },
    })
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
        await this.verifyEventOwnerByTicketPurchase(user, uid)

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
        await this.verifyEventOwnerByTicketPurchase(user, uid)

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

  async validateTicket(user: UserEntity, uid: string, eventId: string) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        await this.verifyEventOwnerByTicketPurchase(user, uid)

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
        await this.verifyEventOwnerByTicketPurchase(user, uid)

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

  private compareSignatureKey(notification: PaymentNotificationDto) {
    const signatureKey = createHash('sha512')
      .update(
        notification.order_id +
          notification.status_code +
          notification.gross_amount +
          config.payment.authString,
      )
      .digest('hex')

    if (signatureKey !== notification.signature_key) {
      throw new ForbiddenException()
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

  private async completeSuccessTicketOrder(
    tx: PrismaClient,
    orderId: string,
    balance?: {
      userId: string
      amount: number
    },
  ) {
    if (balance) {
      await tx.userBalance.update({
        where: { userId: balance.userId },
        data: { balance: { decrement: balance.amount } },
      })
    }

    const [purchase, { ticketId }] = await Promise.all([
      tx.purchase.updateMany({
        where: { orderId },
        data: { status: 'COMPLETED' },
      }),
      tx.purchase.findFirst({
        where: { orderId },
        select: { ticketId: true },
      }),
    ])

    await tx.ticket.update({
      where: { id: ticketId },
      data: { currentStock: { decrement: purchase.count } },
    })
  }

  private async verifyEventOwnerByTicketPurchase(
    ownerUser: UserEntity,
    uid: string,
  ) {
    const {
      ticket: { eventId },
    } = await this.purchaseRepository.findOne({
      where: { uid },
      include: {
        ticket: {
          select: { eventId: true },
        },
      },
    })

    if (!eventId) throw new NotFoundException(exceptions.EVENT.NOT_FOUND)

    await this.eventService.verifyEventOwner(ownerUser, eventId, false)
  }
}
