import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { EventRepository } from './event.repository'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { StorageService } from '../storage/storage.service'
import { config } from '../common/config'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'

@Injectable()
export class EventService {
  constructor(
    private eventRepository: EventRepository,
    private storageService: StorageService,
  ) {}

  async create(
    userId: string,
    createEventDto: CreateEventDto,
    files: {
      event?: Express.Multer.File[]
      ticket?: Express.Multer.File[]
    },
  ) {
    // insert db object
    const tickets = []
    const images = []

    // file
    const eventImages = files.event
    const ticketImages = files.ticket

    for (
      let index = 0;
      index < createEventDto.imageDescriptions.length;
      index++
    ) {
      const image = eventImages[index]
      const filename = await this.storageService.createFile(
        config.storage.eventImagePath,
        image.originalname,
        image.buffer,
      )
      images.push({
        description: createEventDto.imageDescriptions[index],
        image: filename,
      })
    }

    for (let index = 0; index < createEventDto.tickets.length; index++) {
      const image = ticketImages[index]
      const filename = await this.storageService.createFile(
        config.storage.ticketImagePath,
        image.originalname,
        image.buffer,
      )
      tickets.push({
        ...createEventDto.tickets[index],
        image: filename,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageDescriptions, ...data } = createEventDto

    return this.eventRepository.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        tickets: { createMany: { data: [...tickets] } },
        images: {
          createMany: {
            data: images.map((e) => ({
              image: e.image,
              description: e.description,
            })),
          },
        },
      },
      include: { images: true, tickets: true },
    })
  }

  async approve(id: string) {
    try {
      return await this.eventRepository.update({
        where: { id, deletedAt: null },
        data: { status: 'PUBLISHED' },
      })
    } catch {
      throw new NotAcceptableException()
    }
  }

  async findPublished() {
    return await this.eventRepository.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: { images: true },
    })
  }

  async findOnePublished(id: string) {
    const event = await this.eventRepository.findOne({
      where: {
        id,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: { images: true, tickets: true },
    })

    if (!event) throw new NotFoundException()

    return event
  }

  async update(
    user: UserEntity,
    id: string,
    updateEventDto: UpdateEventDto,
    newEventImages?: Express.Multer.File[],
  ) {
    await this.verifyEventOwner(user, id)

    const images: { id: number; description: string; image: string }[] = []
    // populate new images
    for (let index = 0; index < updateEventDto.images.length; index++) {
      const image = newEventImages[index]
      const filename = await this.storageService.createFile(
        config.storage.eventImagePath,
        image.originalname,
        image.buffer,
      )
      images.push({
        id: Number(updateEventDto.images[index].id),
        description: updateEventDto.images[index].description,
        image: filename,
      })
    }
    // get old images
    const oldEventImages = await this.eventRepository.findEventImages({
      where: {
        id: {
          in: [...updateEventDto.images.map((e) => Number(e.id))],
        },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images: _, ...event } = updateEventDto

    // update event & event images
    try {
      const updatedEvent = await this.eventRepository.update({
        where: { id, deletedAt: null },
        data: event,
        updatedImages: images,
        include: { images: true, tickets: false },
      })

      // delete old image files
      for (const image of oldEventImages) {
        this.storageService.deleteFile(
          config.storage.eventImagePath,
          image.image,
        )
      }

      return updatedEvent
    } catch (e) {
      // delete new image files if error
      for (const image of images) {
        this.storageService.deleteFile(
          config.storage.eventImagePath,
          image.image,
        )
      }
      throw new InternalServerErrorException(e)
    }
  }

  async softDelete(user: UserEntity, id: string) {
    await this.verifyEventOwner(user, id)

    try {
      return await this.eventRepository.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date().toISOString() },
      })
    } catch {
      throw new NotAcceptableException()
    }
  }

  private async verifyEventOwner(
    user: UserEntity,
    eventId: string,
    skipAdmin: boolean = true,
  ) {
    // Skip admin verification
    if (skipAdmin && user.groups.includes(Group.ADMIN)) return

    const validOwner = await this.eventRepository.findOne({
      where: { id: eventId, userId: user.id, deletedAt: null },
      include: { tickets: false, images: false },
    })
    if (!validOwner) throw new ForbiddenException()
  }
}
