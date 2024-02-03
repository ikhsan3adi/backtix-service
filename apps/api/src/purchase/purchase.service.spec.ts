import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event/event.service'
import { PaymentService } from '../payment/payment.service'
import { PrismaService } from '../prisma/prisma.service'
import { TicketService } from '../ticket/ticket.service'
import { UserEntity } from '../user/entities/user.entity'
import { PaymentMethod } from './enums/payment-method.enum'
import { PurchaseRepository } from './purchase.repository'
import { PurchaseService } from './purchase.service'

describe('PurchaseService', () => {
  let service: PurchaseService

  describe('createTicketOrder', () => {
    let getAndValidateTicketMock: jest.Mock = jest.fn()
    let createTransactionMock: jest.Mock
    let findUniqueUserMock: jest.Mock
    let findUniqueOrThrowUserMock: jest.Mock
    let findFirstPurchaseMock: jest.Mock
    let findManyPurchaseMock: jest.Mock
    let updateManyPurchaseMock: jest.Mock
    let mockPrismaClient: any

    beforeEach(async () => {
      getAndValidateTicketMock = jest.fn()
      createTransactionMock = jest.fn()
      findUniqueUserMock = jest.fn()
      findUniqueOrThrowUserMock = jest.fn()
      findFirstPurchaseMock = jest.fn()
      findManyPurchaseMock = jest.fn()
      updateManyPurchaseMock = jest.fn()
      mockPrismaClient = {
        user: { findUnique: findUniqueUserMock },
        purchase: {
          createMany: () => {},
          updateMany: updateManyPurchaseMock,
          findFirst: findFirstPurchaseMock,
          findMany: findManyPurchaseMock,
        },
        userBalance: {
          findUniqueOrThrow: findUniqueOrThrowUserMock,
          update: () => {},
        },
        ticket: { update: () => {} },
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PurchaseService,
          PurchaseRepository,
          { provide: EventService, useValue: {} },
          {
            provide: TicketService,
            useValue: { getAndValidateTicket: getAndValidateTicketMock },
          },
          {
            provide: PaymentService,
            useValue: {
              createTransaction: createTransactionMock,
            },
          },
          {
            provide: PrismaService,
            useValue: {
              $transaction: async (callback: (tx: any) => any) =>
                await callback(mockPrismaClient),
            },
          },
        ],
      }).compile()

      service = module.get<PurchaseService>(PurchaseService)
    })

    it('should return transaction pending if pay directly', async () => {
      // Arrange
      const tickets = [
        {
          id: 'ticket123',
          name: 'Ticket 123',
          price: 10000,
          event: {
            userId: 'ownerUserId',
            name: 'Event 123',
          },
          quantity: 1,
        },
      ]
      const transaction = {
        token: 'token',
        redirect_url: 'url',
      }
      const user = {
        id: 'user123',
        fullname: 'John Doe',
        email: 'example@email.com',
      }

      service.idGenerator = jest.fn().mockReturnValue('123')

      getAndValidateTicketMock.mockResolvedValue(tickets[0])
      findUniqueUserMock.mockResolvedValue({ username: 'eventowner' })
      createTransactionMock.mockResolvedValue(transaction)

      const completeTicketOrderSpy = jest.spyOn(
        service,
        'completeSuccessTicketOrder',
      )

      // Action
      const order = await service.createTicketOrder(new UserEntity(user), {
        purchases: [
          {
            quantity: 1,
            ticketId: 'ticket123',
          },
        ],
        paymentMethod: PaymentMethod.direct,
      })

      // Assert
      expect(order.tickets).toStrictEqual(tickets)
      expect(order.transaction).toStrictEqual({
        ...transaction,
        status: 'pending',
      })
      expect(createTransactionMock).toHaveBeenCalledWith({
        transaction_details: {
          order_id: 'BTx-123',
          gross_amount: 10000,
        },
        item_details: [
          {
            id: 'ticket123',
            name: `${tickets[0].name} | ${tickets[0].event.name}`,
            merchant_name: 'eventowner',
            price: tickets[0].price,
            quantity: 1,
          },
        ],
        customer_details: {
          email: user.email,
          first_name: 'John',
          last_name: 'Doe',
        },
        credit_card: { secure: true },
        custom_field1: 0,
      })
      expect(completeTicketOrderSpy).not.toHaveBeenCalled()
    })

    it('should return transaction pending if pay partially using the balance', async () => {
      // Arrange
      const tickets = [
        {
          id: 'ticket123',
          name: 'Ticket 123',
          price: 10000,
          event: {
            userId: 'ownerUserId',
            name: 'Event 123',
          },
          quantity: 1,
        },
      ]
      const transaction = {
        token: 'token',
        redirect_url: 'url',
      }
      const user = {
        id: 'user123',
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'example@email.com',
      }

      service.idGenerator = jest.fn().mockReturnValue('123')

      getAndValidateTicketMock.mockResolvedValue(tickets[0])
      findUniqueUserMock.mockResolvedValue({ username: 'eventowner' })
      createTransactionMock.mockResolvedValue(transaction)
      findUniqueOrThrowUserMock.mockResolvedValue({ balance: 2000 })

      const completeTicketOrderSpy = jest.spyOn(
        service,
        'completeSuccessTicketOrder',
      )

      // Action
      const order = await service.createTicketOrder(new UserEntity(user), {
        purchases: [
          {
            quantity: 1,
            ticketId: 'ticket123',
          },
        ],
        paymentMethod: PaymentMethod.balance,
      })

      // Assert
      expect(order.tickets).toStrictEqual(tickets)
      expect(order.transaction).toStrictEqual({
        ...transaction,
        status: 'pending',
      })
      expect(createTransactionMock).toHaveBeenCalledWith({
        transaction_details: {
          order_id: 'BTx-123',
          gross_amount: 8000,
        },
        item_details: [
          {
            id: 'ticket123',
            name: `${tickets[0].name} | ${tickets[0].event.name}`,
            merchant_name: 'eventowner',
            price: tickets[0].price,
            quantity: 1,
          },
          {
            id: `BTx-123-${user.username}_REBATE`,
            name: 'rebate from the balance',
            merchant_name: 'eventowner',
            price: -2000,
            quantity: 1,
          },
        ],
        customer_details: {
          email: user.email,
          first_name: 'John',
          last_name: 'Doe',
        },
        credit_card: { secure: true },
        custom_field1: 2000,
      })
      expect(completeTicketOrderSpy).not.toHaveBeenCalled()
    })

    it('should return transaction paid if the balance is sufficient', async () => {
      // Arrange
      const tickets = [
        {
          id: 'ticket123',
          name: 'Ticket 123',
          price: 10000,
          event: {
            userId: 'ownerUserId',
            name: 'Event 123',
          },
          quantity: 1,
        },
      ]

      service.idGenerator = jest.fn().mockReturnValue('123')

      getAndValidateTicketMock.mockResolvedValue(tickets[0])
      findUniqueUserMock.mockResolvedValue({ username: 'eventowner' })
      createTransactionMock.mockResolvedValue({
        token: 'token',
        redirect_url: 'url',
      })
      findUniqueOrThrowUserMock.mockResolvedValue({ balance: 10000 })
      updateManyPurchaseMock.mockResolvedValue({ count: 1 })
      findFirstPurchaseMock.mockResolvedValue({ ticketId: 'ticket123' })
      findManyPurchaseMock.mockResolvedValue([{ ticketId: 'ticket123' }])

      const completeTicketOrderSpy = jest.spyOn(
        service,
        'completeSuccessTicketOrder',
      )

      // Action
      const order = await service.createTicketOrder(
        new UserEntity({
          id: 'user123',
          fullname: 'John Doe',
          email: 'example@email.com',
        }),
        {
          purchases: [
            {
              quantity: 1,
              ticketId: 'ticket123',
            },
          ],
          paymentMethod: PaymentMethod.balance,
        },
      )

      // Assert
      expect(order.tickets).toStrictEqual(tickets)
      expect(order.transaction).toStrictEqual({ status: 'paid' })
      expect(createTransactionMock).not.toHaveBeenCalled()
      expect(completeTicketOrderSpy).toHaveBeenCalledWith({
        tx: mockPrismaClient,
        orderId: 'BTx-123',
        eventOwnerId: 'ownerUserId',
        totalRevenue: 10000,
        balanceDeducted: { buyerUserId: 'user123', amount: 10000 },
      })
    })
  })

  describe('notifyTicketOrder', () => {
    let getAndValidateTicketMock: jest.Mock = jest.fn()
    let findFirstPurchaseMock: jest.Mock
    let findManyPurchaseMock: jest.Mock
    let updateManyPurchaseMock: jest.Mock
    let mockPrismaClient: any

    beforeEach(async () => {
      getAndValidateTicketMock = jest.fn()
      findFirstPurchaseMock = jest.fn()
      findManyPurchaseMock = jest.fn()
      updateManyPurchaseMock = jest.fn()
      mockPrismaClient = {
        purchase: {
          updateMany: updateManyPurchaseMock,
          findFirst: findFirstPurchaseMock,
          findMany: findManyPurchaseMock,
        },
        userBalance: { update: () => {} },
        ticket: { update: () => {} },
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PurchaseService,
          PurchaseRepository,
          { provide: EventService, useValue: {} },
          {
            provide: TicketService,
            useValue: { getAndValidateTicket: getAndValidateTicketMock },
          },
          {
            provide: PaymentService,
            useValue: {},
          },
          {
            provide: PrismaService,
            useValue: {
              $transaction: async (callback: (tx: any) => any) =>
                await callback(mockPrismaClient),
            },
          },
        ],
      }).compile()

      service = module.get<PurchaseService>(PurchaseService)
    })

    it('should complete ticket order if transaction status is success (settlement, capture & accept)', async () => {
      // Arrange
      service.compareSignatureKey = jest.fn()

      updateManyPurchaseMock.mockResolvedValue({ count: 1 })
      findManyPurchaseMock.mockResolvedValue([
        {
          ticketId: 'ticket123',
          ticket: { event: { userId: 'owner123' } },
          userId: 'user123',
        },
      ])
      findFirstPurchaseMock.mockResolvedValue({
        ticketId: 'ticket123',
        ticket: { event: { userId: 'owner123' } },
        userId: 'user123',
      })

      const completeTicketOrderSpy = jest.spyOn(
        service,
        'completeSuccessTicketOrder',
      )

      const notification = {
        order_id: 'BTx-123',
        signature_key: '123',
        fraud_status: 'accept',
        transaction_status: 'settlement',
        gross_amount: '8000',
        status_code: '200',
        custom_field1: '2000',
      }

      // Action
      await service.notifyTicketOrder(notification)

      // Assert
      expect(completeTicketOrderSpy).toHaveBeenCalledWith({
        tx: mockPrismaClient,
        orderId: 'BTx-123',
        eventOwnerId: 'owner123',
        totalRevenue:
          Number(notification.gross_amount) +
          Number(notification.custom_field1),
        balanceDeducted: {
          buyerUserId: 'user123',
          amount: Number(notification.custom_field1),
        },
      })
    })

    it('should cancel ticket purchase order if transaction status is failed (cancel, deny & expire)', async () => {
      // Arrange
      service.compareSignatureKey = jest.fn()

      const completeTicketOrderSpy = jest.spyOn(
        service,
        'completeSuccessTicketOrder',
      )

      const notification = {
        order_id: 'BTx-123',
        signature_key: '123',
        fraud_status: 'accept',
        transaction_status: 'expire',
        gross_amount: '8000',
        status_code: '200',
        custom_field1: '2000',
      }

      // Action
      await service.notifyTicketOrder(notification)

      // Assert
      expect(completeTicketOrderSpy).not.toHaveBeenCalled()
      expect(updateManyPurchaseMock).toHaveBeenCalledWith({
        where: { orderId: 'BTx-123', status: 'PENDING' },
        data: { status: 'CANCELLED' },
      })
    })
  })
})
