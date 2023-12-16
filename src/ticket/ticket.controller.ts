import {
  Controller,
  Patch,
  Param,
  Body,
  Post,
  UseInterceptors,
  ParseFilePipe,
  UploadedFile,
  Get,
  Delete,
} from '@nestjs/common'
import { TicketService } from './ticket.service'
import { UserEntity } from '../user/entities/user.entity'
import { User } from '../user/decorators/user.decorator'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { imageValidators } from '../common/files/file-validators'
import { Ticket } from './entities/ticket.entity'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('ticket')
@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ summary: 'Add new ticket to event' })
  @ApiConsumes('multipart/form-data')
  @Post('event/:eventId/ticket')
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
    return new Ticket(
      await this.ticketService.create(user, eventId, createTicketDto, image),
    )
  }

  @ApiOperation({ summary: 'Get ticket detail' })
  @Get('event/:eventId/ticket/:id')
  async findOne(
    @User() user: UserEntity,
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ) {
    return new Ticket(await this.ticketService.findOne(user, eventId, id))
  }

  @ApiOperation({ summary: 'Update ticket' })
  @ApiConsumes('multipart/form-data')
  @Patch('ticket/:id')
  async update(
    @User() user: UserEntity,
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return new Ticket(
      await this.ticketService.update(user, id, updateTicketDto),
    )
  }

  @ApiOperation({ summary: 'Delete ticket' })
  @Delete('ticket/:id')
  async delete(@User() user: UserEntity, @Param('id') id: string) {
    return new Ticket(await this.ticketService.remove(user, id))
  }
}
