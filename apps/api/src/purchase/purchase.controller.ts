import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { Public } from '../auth/decorators/public.decorator'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { CreatePurchaseDto as CreateTicketOrderDto } from './dto/create-ticket-order.dto'
import { PaymentNotificationDto } from './dto/payment-notification.dto'
import { ValidateTicketDto } from './dto/validate-ticket.dto'
import { Purchase } from './entities/purchase.entity'
import { TicketOrder } from './entities/ticket-order.entity'
import { PurchaseService } from './purchase.service'
import { PurchaseRefundService } from './refund/refund.service'
import { PurchaseTicketService } from './ticket/ticket.service'

@ApiTags('purchase')
@ApiBearerAuth()
@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly ticketService: PurchaseTicketService,
    private readonly refundService: PurchaseRefundService,
  ) {}

  @ApiOperation({ summary: 'Request ticket refund/cancel' })
  @Post(':uid/refund')
  async refundTicketOrder(@User() user: UserEntity, @Param('uid') uid: string) {
    return new Purchase(await this.refundService.refundTicketOrder(user, uid))
  }

  @ApiOperation({ summary: 'Accept ticket refund/cancel by event owner' })
  @Patch(':uid/refund')
  async acceptTicketRefund(
    @User() user: UserEntity,
    @Param('uid') uid: string,
  ) {
    return new Purchase(await this.refundService.acceptTicketRefund(user, uid))
  }

  @ApiOperation({ summary: 'Reject ticket refund/cancel by event owner' })
  @Delete(':uid/refund')
  async rejectTicketRefund(
    @User() user: UserEntity,
    @Param('uid') uid: string,
  ) {
    return new Purchase(await this.refundService.rejectTicketRefund(user, uid))
  }

  @ApiOperation({ summary: 'Notify ticket order (used by payment gateway)' })
  @Public()
  @HttpCode(200)
  @Post('ticket/notify')
  async notifyTicketOrder(
    @Req() req: Request,
    @Body() paymentNotificationDto: PaymentNotificationDto,
  ) {
    console.log(req.body)

    return await this.purchaseService.notifyTicketOrder(paymentNotificationDto)
  }

  @ApiOperation({ summary: 'My purchased ticket detail' })
  @Get('ticket/my/:uid')
  async myTicket(@User() user: UserEntity, @Param('uid') uid: string) {
    return new Purchase(await this.ticketService.myTicket(user, uid))
  }

  @ApiOperation({ summary: 'My purchased tickets' })
  @Get('ticket/my')
  async myTickets(
    @User() user: UserEntity,
    @Query('page') page: number,
    @Query('status') status?: string,
    @Query('refundStatus') refundStatus?: string,
    @Query('used', ParseBoolPipe) used: boolean = false,
  ) {
    return (
      await this.ticketService.myTickets(user, page, status, refundStatus, used)
    ).map((e) => new Purchase(e))
  }

  @ApiOperation({ summary: 'Validate purchased ticket uid (from QR Code)' })
  @Post('ticket/validate')
  async validateTicket(
    @User() user: UserEntity,
    @Body() { uid, eventId }: ValidateTicketDto,
  ) {
    return new Purchase(
      await this.ticketService.validateTicket(user, uid, eventId),
    )
  }

  @ApiOperation({ summary: 'Use purchased ticket uid (from QR Code)' })
  @Patch('ticket/use')
  async useTicket(
    @User() user: UserEntity,
    @Body() { uid, eventId }: ValidateTicketDto,
  ) {
    return new Purchase(await this.ticketService.useTicket(user, uid, eventId))
  }

  @ApiOperation({ summary: 'Buy ticket' })
  @Post('ticket')
  async createTicketOrder(
    @User() user: UserEntity,
    @Body() createTicketOrderDto: CreateTicketOrderDto,
  ) {
    return new TicketOrder(
      await this.purchaseService.createTicketOrder(user, createTicketOrderDto),
    )
  }
}
