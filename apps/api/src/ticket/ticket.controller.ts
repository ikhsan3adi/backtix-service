import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { imageValidators } from '../common/files/file-validators'
import { TicketWithPurchasesEntity } from '../purchase/entities/ticket-with-purchases.entity'
import { PurchaseTicketService } from '../purchase/ticket/ticket.service'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { TicketEntity } from './entities/ticket.entity'
import { TicketService } from './ticket.service'

@ApiBearerAuth()
@ApiTags('tickets')
@Controller()
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly purchaseTicketService: PurchaseTicketService,
  ) {}

  @ApiOperation({ summary: 'Add new ticket to event' })
  @ApiConsumes('multipart/form-data')
  @Post('events/:eventId/tickets')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @User() user: UserEntity,
    @Param('eventId') eventId: string,
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFile(
      new ParseFilePipe({ validators: imageValidators, fileIsRequired: false }),
    )
    image: Express.Multer.File,
  ) {
    return new TicketEntity(
      await this.ticketService.create(user, eventId, createTicketDto, image),
    )
  }

  @ApiOperation({ summary: 'Get ticket detail' })
  @Get('events/:eventId/tickets/:id')
  async findOne(
    @User() user: UserEntity,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ) {
    return new TicketEntity(await this.ticketService.findOne(user, eventId, id))
  }

  @ApiOperation({ summary: 'Update ticket' })
  @ApiConsumes('multipart/form-data')
  @Patch('tickets/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @User() user: UserEntity,
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @UploadedFile(
      new ParseFilePipe({ validators: imageValidators, fileIsRequired: false }),
    )
    image: Express.Multer.File,
  ) {
    return new TicketEntity(
      await this.ticketService.update(user, id, updateTicketDto, image),
    )
  }

  @ApiOperation({ summary: 'Delete ticket' })
  @Delete('tickets/:id')
  async delete(@User() user: UserEntity, @Param('id') id: string) {
    return new TicketEntity(await this.ticketService.remove(user, id))
  }

  @Get('tickets/:id/purchases')
  async purchasesByTicket(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('status')
    status?: string,
    @Query('refundStatus')
    refundStatus?: string,
    @Query('used', new ParseBoolPipe({ optional: true }))
    used?: boolean,
  ) {
    return new TicketWithPurchasesEntity(
      await this.purchaseTicketService.purchasesByTicket(
        id,
        page,
        status as any,
        refundStatus as any,
        used,
      ),
    )
  }
}
