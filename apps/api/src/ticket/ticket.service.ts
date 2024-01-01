import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { config } from '../common/config'
import { exceptions } from '../common/exceptions/exceptions'
import { EventService } from '../event/event.service'
import { StorageService } from '../storage/storage.service'
import { UserEntity } from '../user/entities/user.entity'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { TicketRepository } from './ticket.repository'

@Injectable()
export class TicketService {
  constructor(
    private ticketRepository: TicketRepository,
    private eventService: EventService,
    private storageService: StorageService,
  ) {}

  async create(
    user: UserEntity,
    eventId: string,
    createTicketDto: CreateTicketDto,
    ticketImage?: Express.Multer.File,
  ) {
    await this.eventService.verifyEventOwner(user, eventId)

    const filename = ticketImage
      ? await this.storageService.generateRandomFilename(
          ticketImage.originalname,
        )
      : undefined

    const createdTicket = await this.ticketRepository.create({
      data: {
        ...createTicketDto,
        currentStock: createTicketDto.stock,
        event: { connect: { id: eventId } },
        image: filename,
      },
    })
    if (filename) {
      await this.storageService.createFile(
        config.storage.eventImagePath,
        filename,
        ticketImage.buffer,
      )
    }
    return createdTicket
  }

  async findOne(user: UserEntity, eventId: string, id: string) {
    try {
      await this.eventService.findOne(eventId)
    } catch {
      await this.eventService.verifyEventOwner(user, eventId)
    }

    const ticket = await this.ticketRepository.findOne({
      where: { id },
      include: {
        _count: {
          select: {
            purchases: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    })
    if (!ticket) throw new NotFoundException()

    return ticket
  }

  async update(
    user: UserEntity,
    id: string,
    updateTicketDto: UpdateTicketDto,
    newTicketImage?: Express.Multer.File,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      include: { event: true },
    })
    await this.eventService.verifyEventOwner(user, ticket.event.id)

    const filename = newTicketImage
      ? await this.storageService.generateRandomFilename(
          newTicketImage.originalname,
        )
      : undefined

    const { additionalStock, ...data } = updateTicketDto

    try {
      const updatedTicket = await this.ticketRepository.update({
        where: { id },
        data: {
          ...data,
          stock: { increment: additionalStock },
          currentStock: { increment: additionalStock },
          image: filename,
        },
      })
      if (filename) {
        await this.storageService.createFile(
          config.storage.eventImagePath,
          filename,
          newTicketImage.buffer,
        )
      }
      return updatedTicket
    } catch (e) {
      console.error(e)

      if (filename)
        this.storageService.deleteFile(config.storage.eventImagePath, filename)
      throw new InternalServerErrorException(e)
    }
  }

  async remove(user: UserEntity, id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      include: {
        event: true,
        // purchases: {
        //   where: { status: 'COMPLETED' },
        //   take: 1,
        //   select: { status: true },
        // },
      },
    })
    if (!ticket) throw new NotFoundException()
    if (ticket.event.status === 'PUBLISHED') {
      throw new NotAcceptableException(
        exceptions.TICKET.DELETE_PUBLISHED_TICKET,
      )
    }
    // if (ticket.purchases.length > 0) {
    //   throw new NotAcceptableException(
    //     exceptions.TICKET.DELETE_PURCHASED_TICKET,
    //   )
    // }
    await this.eventService.verifyEventOwner(user, ticket.event.id)

    return this.ticketRepository.remove({ where: { id } })
  }

  public async getAndValidateTicket(ticketId: string, quantity: number = 1) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      include: { event: true },
    })

    if (!ticket) {
      throw new NotFoundException(exceptions.TICKET.NOT_FOUND)
    } else if (ticket.currentStock < quantity) {
      throw new BadRequestException(exceptions.TICKET.INSUFFICIENT_STOCK)
    } else if (new Date() < ticket.salesOpenDate) {
      throw new BadRequestException(exceptions.TICKET.SALES_NOT_YET_OPEN)
    } else if (new Date() > ticket.purchaseDeadline) {
      throw new BadRequestException(exceptions.TICKET.SALES_CLOSED)
    } else if (ticket.event.status !== 'PUBLISHED') {
      throw new BadRequestException(exceptions.TICKET.INVALID)
    } else if (ticket.event.deletedAt !== null) {
      throw new ForbiddenException(exceptions.TICKET.INVALID)
    }

    return ticket
  }
}
