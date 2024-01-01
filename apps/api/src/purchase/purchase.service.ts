import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'
import { nanoid } from 'nanoid'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'
import { EventService } from '../event/event.service'
import { PaymentService } from '../payment/payment.service'
import { TicketService } from '../ticket/ticket.service'
import { UserEntity } from '../user/entities/user.entity'
import { CreatePurchaseDto } from './dto/create-ticket-order.dto'
import { PaymentNotificationDto } from './dto/payment-notification.dto'
import { PaymentMethod } from './enums/payment-method.enum'
import { PurchaseRepository } from './purchase.repository'

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
        const {
          ticket: {
            event: { userId: eventOwnerId },
          },
          userId,
        } = await tx.purchase.findFirst({
          where: { orderId },
          select: {
            userId: true,
            ticket: { select: { event: { select: { userId: true } } } },
          },
        })

        return await this.completeSuccessTicketOrder({
          tx,
          orderId,
          eventOwnerId,
          totalRevenue:
            Number(grossAmount) + (balanceUsed ? Number(balanceUsed) : 0),
          balanceDeducted: balanceUsed
            ? { buyerUserId: userId, amount: Number(balanceUsed) }
            : undefined,
        })
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
            await this.completeSuccessTicketOrder({
              tx,
              orderId,
              eventOwnerId: ticket.event.userId,
              totalRevenue: TOTAL_PRICE,
              balanceDeducted: {
                buyerUserId: user.id,
                amount: TOTAL_PRICE,
              },
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

  /**
   * Used in `purchase ticket service` & `refund service`
   */
  public async verifyEventOwnerByTicketPurchase(
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

  async completeSuccessTicketOrder(params: {
    tx: PrismaClient
    orderId: string
    eventOwnerId: string
    totalRevenue: number
    balanceDeducted?: {
      buyerUserId: string
      amount: number
    }
  }) {
    const { tx, orderId, eventOwnerId, totalRevenue, balanceDeducted } = params
    // user balance deduction (if any)
    if (balanceDeducted) {
      await tx.userBalance.update({
        where: { userId: balanceDeducted.buyerUserId },
        data: { balance: { decrement: balanceDeducted.amount } },
      })
    }
    // change purchase status to completed
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
    // reduce current ticket stock
    await tx.ticket.update({
      where: { id: ticketId },
      data: { currentStock: { decrement: purchase.count } },
    })
    // event owner earns revenue
    await tx.userBalance.update({
      where: { userId: eventOwnerId },
      data: { revenue: { increment: totalRevenue } },
    })
  }

  compareSignatureKey(notification: PaymentNotificationDto) {
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
}
