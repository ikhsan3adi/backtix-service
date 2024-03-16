import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../auth/decorators/public.decorator'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { CreateTicketOrderDto } from './dto/create-ticket-order.dto'
import { PaymentNotificationDto } from './dto/payment-notification.dto'
import { ValidateTicketDto } from './dto/validate-ticket.dto'
import { EventWithPurchasesEntity } from './entities/event-with-purchases.entity'
import { PurchaseEntity } from './entities/purchase.entity'
import { TicketOrderEntity } from './entities/ticket-order.entity'
import { PurchaseService } from './purchase.service'
import { PurchaseRefundService } from './refund/refund.service'
import { PurchaseTicketService } from './ticket/ticket.service'

@ApiTags('purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly ticketService: PurchaseTicketService,
    private readonly refundService: PurchaseRefundService,
  ) {}

  @ApiOperation({ summary: 'Request ticket refund/cancel' })
  @Post(':uid/refund')
  async refundTicketOrder(
    @User() user: UserEntity,
    @Param('uid') uid: string,
    @Query('eventId') eventId: string,
  ) {
    return new PurchaseEntity(
      await this.refundService.refundTicketOrder(user, uid, eventId),
    )
  }

  @ApiOperation({ summary: 'Accept ticket refund/cancel by event owner' })
  @Patch(':uid/refund')
  async acceptTicketRefund(
    @User() user: UserEntity,
    @Param('uid') uid: string,
  ) {
    return new PurchaseEntity(
      await this.refundService.acceptTicketRefund(user, uid),
    )
  }

  @ApiOperation({ summary: 'Reject ticket refund/cancel by event owner' })
  @Delete(':uid/refund')
  async rejectTicketRefund(
    @User() user: UserEntity,
    @Param('uid') uid: string,
  ) {
    return new PurchaseEntity(
      await this.refundService.rejectTicketRefund(user, uid),
    )
  }

  @ApiOperation({ summary: 'Notify ticket order (used by payment gateway)' })
  @Public()
  @HttpCode(200)
  @Post('ticket/notify')
  async notifyTicketOrder(
    // @Req() req: Request,
    @Body() paymentNotificationDto: PaymentNotificationDto,
  ) {
    // console.log(req.body)

    return await this.purchaseService.notifyTicketOrder(paymentNotificationDto)
  }

  @ApiOperation({ summary: 'My purchased ticket detail' })
  @Get('ticket/my/:uid')
  async myTicket(@User() user: UserEntity, @Param('uid') uid: string) {
    return new PurchaseEntity(await this.ticketService.myTicket(user, uid))
  }

  @ApiOperation({ summary: 'My purchased tickets' })
  @Get('ticket/my')
  async myTickets(
    @User() user: UserEntity,
    @Query('page') page: number,
    @Query('status') status?: string,
    @Query('refundStatus') refundStatus?: string,
    @Query('used') used: boolean = false,
  ) {
    return (
      await this.ticketService.myTickets(user, page, status, refundStatus, used)
    ).map((e) => new EventWithPurchasesEntity(e))
  }

  @ApiOperation({ summary: 'Validate purchased ticket uid (from QR Code)' })
  @Post('ticket/validate')
  async validateTicket(
    @User() user: UserEntity,
    @Body() { uid, eventId }: ValidateTicketDto,
  ) {
    return new PurchaseEntity(
      await this.ticketService.validateTicket(user, uid, eventId),
    )
  }

  @ApiOperation({ summary: 'Use purchased ticket uid (from QR Code)' })
  @Patch('ticket/use')
  async useTicket(
    @User() user: UserEntity,
    @Body() { uid, eventId }: ValidateTicketDto,
  ) {
    return new PurchaseEntity(
      await this.ticketService.useTicket(user, uid, eventId),
    )
  }

  @ApiOperation({ summary: 'Buy ticket' })
  @Post('ticket')
  async createTicketOrder(
    @User() user: UserEntity,
    @Body() createTicketOrderDto: CreateTicketOrderDto,
  ) {
    return new TicketOrderEntity(
      await this.purchaseService.createTicketOrder(user, createTicketOrderDto),
    )
  }
}
