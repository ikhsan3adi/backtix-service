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

  /**
   * Used by payment gateway
   */
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
    { paymentMethod, purchases }: CreatePurchaseDto,
  ) {
    try {
      return await this.purchaseRepository.createTransactions(async (tx) => {
        const ticketPurchases = (
          await Promise.all(
            purchases.map((e) =>
              this.ticketService.getAndValidateTicket(e.ticketId, e.quantity),
            ),
          )
        ).map((t) => ({
          ...t,
          quantity: purchases.find((e) => e.ticketId === t.id).quantity,
        }))

        const orderId = `BTx-${this.idGenerator(12)}`

        const [{ username: eventOwnerUsername }] = await Promise.all([
          tx.user.findUnique({
            where: { id: ticketPurchases[0].event.userId },
            select: { username: true },
          }),
          ...ticketPurchases.map((t) =>
            tx.purchase.createMany({
              data: Array.from(
                { length: t.quantity },
                (): Prisma.PurchaseCreateManyInput => ({
                  orderId,
                  ticketId: t.id,
                  price: t.price,
                  status: 'PENDING',
                  userId: user.id,
                }),
              ),
            }),
          ),
        ])

        const customerFullnameSplitted = user.fullname.split(' ')

        let TOTAL_PRICE = ticketPurchases
          .map((e) => e.price * e.quantity)
          .reduce((p, c) => p + c)

        let REBATE = 0 // if using user balance

        const item_details = ticketPurchases.map((t) => ({
          id: t.id,
          name: `${t.name} | ${t.event.name}`,
          merchant_name: eventOwnerUsername,
          price: t.price,
          quantity: t.quantity,
        }))

        if (paymentMethod === PaymentMethod.balance) {
          const { balance: userBalance } =
            await tx.userBalance.findUniqueOrThrow({
              where: { userId: user.id },
              select: { balance: true },
            })

          if (userBalance >= TOTAL_PRICE) {
            await this.completeSuccessTicketOrder({
              tx,
              orderId,
              eventOwnerId: ticketPurchases[0].event.userId,
              totalRevenue: TOTAL_PRICE,
              balanceDeducted: {
                buyerUserId: user.id,
                amount: TOTAL_PRICE,
              },
            })
            return {
              tickets: ticketPurchases.map((e) => ({
                ...e,
                currentStock: e.currentStock - e.quantity,
              })),
              transaction: { status: 'paid' },
            }
          }

          REBATE = userBalance
          TOTAL_PRICE -= REBATE

          item_details.push({
            id: `${orderId}-${user.username}_REBATE`,
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

        return {
          tickets: ticketPurchases,
          transaction: { ...transaction, status: 'pending' },
        }
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
    // change purchase status to completed & get ticket ids
    const [ticketIds] = await Promise.all([
      tx.purchase.findMany({
        where: { orderId },
        select: { ticketId: true },
      }),
      tx.purchase.updateMany({
        where: { orderId },
        data: { status: 'COMPLETED' },
      }),
    ])

    // remove duplicate ids & reduce current ticket stock
    await Promise.all(
      [...new Set(ticketIds.map((e) => e.ticketId))].map((uniqueId) =>
        tx.ticket.update({
          where: { id: uniqueId },
          data: {
            currentStock: {
              decrement: ticketIds.filter(
                ({ ticketId }) => ticketId === uniqueId,
              ).length,
            },
          },
        }),
      ),
    )
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
