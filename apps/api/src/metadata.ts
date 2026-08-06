/* eslint-disable */
export default async () => {
  const t = {
    ['./user/enums/group.enum']: await import('./user/enums/group.enum'),
    ['./event/entities/event.entity']:
      await import('./event/entities/event.entity'),
    ['./event/entities/event-image.entity']:
      await import('./event/entities/event-image.entity'),
    ['./ticket/entities/ticket.entity']:
      await import('./ticket/entities/ticket.entity'),
    ['./user/entities/user.entity']:
      await import('./user/entities/user.entity'),
    ['./purchase/entities/purchase.entity']:
      await import('./purchase/entities/purchase.entity'),
    ['./ticket/dto/create-ticket.dto']:
      await import('./ticket/dto/create-ticket.dto'),
    ['./event/dto/update-event-image.dto']:
      await import('./event/dto/update-event-image.dto'),
    ['./purchase/dto/create-ticket-order.dto']:
      await import('./purchase/dto/create-ticket-order.dto'),
    ['./purchase/enums/payment-method.enum']:
      await import('./purchase/enums/payment-method.enum'),
    ['./balance/entities/withdraw-request.entity']:
      await import('./balance/entities/withdraw-request.entity'),
    ['./notifications/entities/notification.entity']:
      await import('./notifications/entities/notification.entity'),
    ['./purchase/entities/ticket-with-purchases.entity']:
      await import('./purchase/entities/ticket-with-purchases.entity'),
    ['./purchase/entities/event-with-purchases.entity']:
      await import('./purchase/entities/event-with-purchases.entity'),
    ['./purchase/entities/ticket-order.entity']:
      await import('./purchase/entities/ticket-order.entity'),
  }
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./user/entities/user.entity'),
          {
            UserEntity: {
              provider: { required: true, type: () => String },
              id: { required: true, type: () => String },
              username: { required: true, type: () => String },
              fullname: { required: true, type: () => String },
              email: { required: true, type: () => String },
              location: { required: true, type: () => String },
              latitude: { required: true, type: () => Number },
              longitude: { required: true, type: () => Number },
              locationGeography: { required: false, type: () => Object },
              image: { required: true, type: () => String },
              groups: { required: true, type: () => Object },
              activated: { required: true, type: () => Boolean },
              createdAt: { required: true, type: () => Date },
              updatedAt: { required: true, type: () => Date },
              deletedAt: { required: false, type: () => Date },
              balance: {
                required: false,
                type: () => ({
                  balance: { required: true, type: () => Number },
                  revenue: { required: true, type: () => Number },
                }),
              },
            },
          },
        ],
        [
          import('./user/dto/create-user.dto'),
          {
            CreateUserDto: {
              username: { required: true, type: () => String },
              fullname: { required: true, type: () => String },
              email: { required: true, type: () => String },
              password: { required: true, type: () => String },
              provider: { required: true, type: () => String },
              image: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./user/dto/update-user.dto'),
          {
            UpdateUserDto: {
              location: { required: true, type: () => String },
              latitude: { required: true, type: () => Number },
              longitude: { required: true, type: () => Number },
              deleteImage: {
                required: false,
                type: () => Boolean,
                default: false,
              },
            },
          },
        ],
        [
          import('./user/dto/admin-update-user.dto'),
          {
            AdminUpdateUserDto: {
              id: { required: false, type: () => String },
              username: { required: true, type: () => String },
              fullname: { required: true, type: () => String },
              email: { required: true, type: () => String },
              password: { required: true, type: () => String },
              activated: { required: false, type: () => Boolean },
              groups: {
                required: false,
                enum: t['./user/enums/group.enum'].Group,
                isArray: true,
              },
              balance: { required: false, type: () => Number },
              revenue: { required: false, type: () => Number },
              location: { required: true, type: () => String },
              latitude: { required: true, type: () => Number },
              longitude: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./user/dto/reset-password.dto'),
          {
            ResetPasswordDto: {
              resetCode: { required: true, type: () => String },
              newPassword: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./user/dto/update-user-password.dto'),
          {
            UpdateUserPasswordDto: {
              oldPassword: { required: true, type: () => String },
              newPassword: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./balance/dto/create-withdraw-request.dto'),
          {
            CreateWithdrawRequestDto: {
              amount: { required: true, type: () => Number },
              method: { required: true, type: () => String },
              details: { required: true, type: () => String },
              from: { required: true, type: () => Object },
            },
          },
        ],
        [
          import('./balance/entities/withdraw-request.entity'),
          {
            WithdrawRequestEntity: {
              id: { required: true, type: () => String },
              amount: { required: true, type: () => Number },
              fee: { required: true, type: () => Number },
              method: { required: true, type: () => String },
              details: { required: true, type: () => String },
              from: { required: true, type: () => String },
              status: { required: true, type: () => String },
              createdAt: { required: true, type: () => Date },
              updatedAt: { required: true, type: () => Date },
              user: { required: true, type: () => Object },
            },
          },
        ],
        [
          import('./ticket/entities/ticket.entity'),
          {
            TicketEntity: {
              id: { required: true, type: () => String },
              name: { required: true, type: () => String },
              price: { required: true, type: () => Number },
              stock: { required: true, type: () => Number },
              currentStock: { required: true, type: () => Number },
              image: { required: true, type: () => String },
              salesOpenDate: { required: true, type: () => Date },
              purchaseDeadline: { required: true, type: () => Date },
              createdAt: { required: true, type: () => Date },
              updatedAt: { required: true, type: () => Date },
              event: {
                required: false,
                type: () => t['./event/entities/event.entity'].EventEntity,
              },
            },
          },
        ],
        [
          import('./event/entities/event-image.entity'),
          {
            EventImageEntity: {
              id: { required: true, type: () => Number },
              description: { required: true, type: () => String },
              image: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./event/entities/event.entity'),
          {
            EventEntity: {
              id: { required: true, type: () => String },
              name: { required: true, type: () => String },
              date: { required: true, type: () => Date },
              endDate: { required: false, type: () => Date },
              location: { required: true, type: () => String },
              latitude: { required: true, type: () => Number },
              longitude: { required: true, type: () => Number },
              description: { required: true, type: () => String },
              categories: { required: true, type: () => [String] },
              status: { required: true, type: () => String },
              ticketAvailable: { required: false, type: () => Boolean },
              createdAt: { required: true, type: () => Date },
              updatedAt: { required: true, type: () => Date },
              deletedAt: { required: false, type: () => Date },
              images: {
                required: false,
                type: () => [
                  t['./event/entities/event-image.entity'].EventImageEntity,
                ],
              },
              tickets: {
                required: false,
                type: () => [t['./ticket/entities/ticket.entity'].TicketEntity],
              },
              user: {
                required: false,
                type: () => t['./user/entities/user.entity'].UserEntity,
              },
            },
          },
        ],
        [
          import('./notifications/entities/notification.entity'),
          {
            NotificationEntity: {
              id: { required: true, type: () => Number },
              userId: { required: false, type: () => String },
              message: { required: true, type: () => String },
              type: { required: true, type: () => String },
              entityType: { required: false, type: () => String },
              entityId: { required: false, type: () => String },
              createdAt: { required: true, type: () => Date },
              updatedAt: { required: false, type: () => Date },
            },
          },
        ],
        [
          import('./notifications/dto/create-notification.dto'),
          {
            CreateNotificationDto: {
              id: { required: false, type: () => Number },
              userId: { required: false, type: () => String },
              message: { required: true, type: () => String },
              type: { required: true, type: () => Object },
              entityType: { required: false, type: () => Object },
              entityId: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./purchase/entities/purchase.entity'),
          {
            PurchaseEntity: {
              uid: { required: true, type: () => String },
              ticketId: { required: true, type: () => String },
              userId: { required: true, type: () => String },
              orderId: { required: true, type: () => String },
              price: { required: true, type: () => Number },
              status: { required: true, type: () => String },
              refundStatus: { required: true, type: () => String },
              used: { required: true, type: () => Boolean },
              createdAt: { required: true, type: () => Date },
              updatedAt: { required: true, type: () => Date },
              deletedAt: { required: true, type: () => Date },
              ticket: {
                required: true,
                type: () => t['./ticket/entities/ticket.entity'].TicketEntity,
              },
              user: {
                required: true,
                type: () => t['./user/entities/user.entity'].UserEntity,
              },
            },
          },
        ],
        [
          import('./purchase/entities/ticket-with-purchases.entity'),
          {
            TicketWithPurchasesEntity: {
              ticket: {
                required: true,
                type: () => t['./ticket/entities/ticket.entity'].TicketEntity,
              },
              purchases: {
                required: true,
                type: () => [
                  t['./purchase/entities/purchase.entity'].PurchaseEntity,
                ],
              },
            },
          },
        ],
        [
          import('./ticket/dto/create-ticket.dto'),
          {
            CreateTicketDto: {
              name: { required: true, type: () => String },
              price: { required: true, type: () => Number },
              stock: { required: true, type: () => Number },
              image: { required: false, type: () => Object },
              hasImage: {
                required: false,
                type: () => Boolean,
                default: false,
              },
              salesOpenDate: { required: true, type: () => String },
              purchaseDeadline: {
                required: true,
                type: () => String,
                default: null,
              },
            },
          },
        ],
        [
          import('./event/dto/create-event.dto'),
          {
            CreateEventDto: {
              name: { required: true, type: () => String },
              date: { required: true, type: () => String },
              endDate: { required: true, type: () => String, default: null },
              location: { required: true, type: () => String },
              latitude: { required: true, type: () => Number },
              longitude: { required: true, type: () => Number },
              description: { required: true, type: () => String },
              categories: { required: true, type: () => [String] },
              imageDescriptions: { required: true, type: () => [String] },
              tickets: {
                required: true,
                type: () => [
                  t['./ticket/dto/create-ticket.dto'].CreateTicketDto,
                ],
              },
              event: { required: true, type: () => [Object] },
              ticket: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import('./event/dto/update-event-image.dto'),
          {
            UpdateEventImageDto: {
              id: { required: true, type: () => Number },
              description: { required: true, type: () => String },
              withImage: {
                required: false,
                type: () => Boolean,
                default: false,
              },
              delete: { required: false, type: () => Boolean, default: false },
            },
          },
        ],
        [
          import('./event/dto/update-event.dto'),
          {
            UpdateEventDto: {
              images: {
                required: true,
                type: () => [
                  t['./event/dto/update-event-image.dto'].UpdateEventImageDto,
                ],
              },
              event: { required: true, type: () => [Object] },
            },
          },
        ],
        [
          import('./ticket/dto/update-ticket.dto'),
          {
            UpdateTicketDto: {
              additionalStock: {
                required: false,
                type: () => Number,
                default: 0,
              },
              deleteImage: {
                required: false,
                type: () => Boolean,
                default: false,
              },
            },
          },
        ],
        [
          import('./purchase/dto/create-ticket-order.dto'),
          {
            TicketPurchase: {
              ticketId: { required: true, type: () => String },
              quantity: { required: true, type: () => Number, default: 1 },
            },
            CreateTicketOrderDto: {
              purchases: {
                required: true,
                type: () => [
                  t['./purchase/dto/create-ticket-order.dto'].TicketPurchase,
                ],
              },
              paymentMethod: {
                required: true,
                enum: t['./purchase/enums/payment-method.enum'].PaymentMethod,
              },
            },
          },
        ],
        [
          import('./purchase/dto/payment-notification.dto'),
          {
            PaymentNotificationDto: {
              order_id: { required: true, type: () => String },
              transaction_status: { required: true, type: () => String },
              fraud_status: {
                required: true,
                type: () => String,
                default: 'accept',
              },
              gross_amount: { required: true, type: () => String },
              signature_key: { required: true, type: () => String },
              status_code: { required: true, type: () => String },
              custom_field1: { required: false, type: () => Object },
            },
          },
        ],
        [
          import('./purchase/dto/validate-ticket.dto'),
          {
            ValidateTicketDto: {
              uid: { required: true, type: () => String },
              eventId: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./purchase/entities/event-with-purchases.entity'),
          {
            EventWithPurchasesEntity: {
              event: {
                required: true,
                type: () => t['./event/entities/event.entity'].EventEntity,
              },
              purchases: {
                required: true,
                type: () => [
                  t['./purchase/entities/purchase.entity'].PurchaseEntity,
                ],
              },
            },
          },
        ],
        [
          import('./purchase/entities/ticket-order.entity'),
          {
            TicketOrderEntity: {
              tickets: {
                required: true,
                type: () => [t['./ticket/entities/ticket.entity'].TicketEntity],
              },
            },
          },
        ],
        [
          import('./notifications/dto/update-notification.dto'),
          { UpdateNotificationDto: {} },
        ],
        [
          import('./purchase/dto/update-purchase.dto'),
          { UpdatePurchaseDto: {} },
        ],
      ],
      controllers: [
        [
          import('./app.controller'),
          { AppController: { getHello: { type: String } } },
        ],
        [
          import('./user/user.controller'),
          {
            UserController: {
              myDetails: { type: t['./user/entities/user.entity'].UserEntity },
              editMyUser: {},
              requestPasswordReset: {},
              passwordReset: {
                type: t['./user/entities/user.entity'].UserEntity,
              },
              updateMyPassword: {
                type: t['./user/entities/user.entity'].UserEntity,
              },
              editUserByAdmin: {
                type: t['./user/entities/user.entity'].UserEntity,
              },
            },
          },
        ],
        [
          import('./auth/auth.controller'),
          {
            AuthController: {
              signUp: { type: t['./user/entities/user.entity'].UserEntity },
              signIn: {},
              requestWebGoogleAuth: { description: 'Web only' },
              googleAuthCallback: { description: 'Web only', type: Object },
              requestGoogleAuth: { type: Object },
              refreshAuth: {},
              logout: {},
              requestActivation: {},
              activateUser: {
                type: t['./user/entities/user.entity'].UserEntity,
              },
              requestAdminEmailSignIn: {},
              adminOtpSignIn: {},
            },
          },
        ],
        [
          import('./balance/balance.controller'),
          {
            BalanceController: {
              getUserBalanceWithAdminFee: {},
              myWithdrawals: {
                type: [
                  t['./balance/entities/withdraw-request.entity']
                    .WithdrawRequestEntity,
                ],
              },
              requestWithdrawal: {
                type: t['./balance/entities/withdraw-request.entity']
                  .WithdrawRequestEntity,
              },
              withdrawRequests: {
                type: [
                  t['./balance/entities/withdraw-request.entity']
                    .WithdrawRequestEntity,
                ],
              },
            },
          },
        ],
        [
          import('./file/file.controller'),
          { FileController: { getUploadedFile: {} } },
        ],
        [
          import('./notifications/notifications.controller'),
          {
            NotificationsController: {
              findAllImportantByUserId: {
                type: [
                  t['./notifications/entities/notification.entity']
                    .NotificationEntity,
                ],
              },
              findAllInfo: {
                type: [
                  t['./notifications/entities/notification.entity']
                    .NotificationEntity,
                ],
              },
              readAllNotification: {},
              readNotification: {},
            },
          },
        ],
        [
          import('./ticket/ticket.controller'),
          {
            TicketController: {
              create: {
                type: t['./ticket/entities/ticket.entity'].TicketEntity,
              },
              findOne: {
                type: t['./ticket/entities/ticket.entity'].TicketEntity,
              },
              update: {
                type: t['./ticket/entities/ticket.entity'].TicketEntity,
              },
              delete: {
                type: t['./ticket/entities/ticket.entity'].TicketEntity,
              },
              purchasesByTicket: {
                type: t['./purchase/entities/ticket-with-purchases.entity']
                  .TicketWithPurchasesEntity,
              },
            },
          },
        ],
        [
          import('./purchase/purchase.controller'),
          {
            PurchaseController: {
              refundTicketOrder: {
                type: t['./purchase/entities/purchase.entity'].PurchaseEntity,
              },
              acceptTicketRefund: {
                type: t['./purchase/entities/purchase.entity'].PurchaseEntity,
              },
              rejectTicketRefund: {
                type: t['./purchase/entities/purchase.entity'].PurchaseEntity,
              },
              notifyTicketOrder: {},
              myTicket: {
                type: t['./purchase/entities/purchase.entity'].PurchaseEntity,
              },
              myTickets: {
                type: [
                  t['./purchase/entities/event-with-purchases.entity']
                    .EventWithPurchasesEntity,
                ],
              },
              validateTicket: {
                type: t['./purchase/entities/purchase.entity'].PurchaseEntity,
              },
              useTicket: {
                type: t['./purchase/entities/purchase.entity'].PurchaseEntity,
              },
              createTicketOrder: {
                type: t['./purchase/entities/ticket-order.entity']
                  .TicketOrderEntity,
              },
            },
          },
        ],
        [
          import('./event/event.controller'),
          {
            EventController: {
              create: { type: t['./event/entities/event.entity'].EventEntity },
              approve: { type: t['./event/entities/event.entity'].EventEntity },
              reject: { type: t['./event/entities/event.entity'].EventEntity },
              retryPublish: {
                type: t['./event/entities/event.entity'].EventEntity,
              },
              findAllPublished: {
                type: [t['./event/entities/event.entity'].EventEntity],
              },
              findNearestPublishedEvents: {
                type: [t['./event/entities/event.entity'].EventEntity],
              },
              myEvents: {
                type: [t['./event/entities/event.entity'].EventEntity],
              },
              myEventDetail: {
                type: t['./event/entities/event.entity'].EventEntity,
              },
              findOnePublished: {
                type: t['./event/entities/event.entity'].EventEntity,
              },
              update: { type: t['./event/entities/event.entity'].EventEntity },
              softDelete: {
                type: t['./event/entities/event.entity'].EventEntity,
              },
              purchasesByEvent: {
                type: [t['./purchase/entities/purchase.entity'].PurchaseEntity],
              },
            },
          },
        ],
      ],
    },
  }
}
