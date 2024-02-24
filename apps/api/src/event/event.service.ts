import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { config } from '../common/config'
import { StorageService } from '../storage/storage.service'
import { UserEntity } from '../user/entities/user.entity'
import { Group } from '../user/enums/group.enum'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { EventRepository } from './event.repository'

@Injectable()
export class EventService {
  constructor(
    private eventRepository: EventRepository,
    private storageService: StorageService,
  ) {
    this.perPage = config.pagination.eventPerPage
  }

  perPage: number

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
    const eventImages = []

    // file
    const eventImageFiles = files.event?.slice()
    const ticketImageFiles = files.ticket?.slice()

    // generate event images data & filename
    for (const imageDescription of createEventDto.imageDescriptions) {
      const filename = await this.storageService.generateRandomFilename(
        eventImageFiles.shift().originalname,
      )
      eventImages.push({
        description: imageDescription ? undefined : imageDescription,
        image: filename,
      })
    }

    // generate tickets images data & filename
    for (const { hasImage, ...ticket } of createEventDto.tickets) {
      const filename = hasImage
        ? await this.storageService.generateRandomFilename(
            ticketImageFiles.shift().originalname,
          )
        : undefined
      tickets.push({
        ...ticket,
        currentStock: ticket.stock,
        image: filename,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageDescriptions, ...data } = createEventDto

    const createdEvent = await this.eventRepository.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        tickets: { createMany: { data: [...tickets] } },
        images: {
          createMany: {
            data: eventImages.map((e) => ({
              image: e.image,
              description: e.description,
            })),
          },
        },
      },
      include: { images: true, tickets: true },
    })

    // save images
    const eventImageFilesCopy = files.event?.slice()
    const ticketImageFilesCopy = files.ticket?.slice()

    for (const { image } of eventImages) {
      await this.storageService.createFile(
        config.storage.eventImagePath,
        image,
        eventImageFilesCopy.shift().buffer,
      )
    }
    for (const { image } of tickets) {
      if (!image) continue

      await this.storageService.createFile(
        config.storage.ticketImagePath,
        image,
        ticketImageFilesCopy.shift().buffer,
      )
    }
    return createdEvent
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

  async reject(id: string) {
    try {
      return await this.eventRepository.update({
        where: { id, deletedAt: null },
        data: { status: 'REJECTED' },
      })
    } catch {
      throw new NotAcceptableException()
    }
  }

  async retry(id: string) {
    try {
      return await this.eventRepository.update({
        where: { id, deletedAt: null },
        data: { status: 'DRAFT' },
      })
    } catch {
      throw new NotAcceptableException()
    }
  }

  async findPublished(
    page: number = 0,
    byStartDate?: boolean,
    from?: string,
    to?: string,
    search?: string,
    location?: string,
    categories?: string[],
    endedOnly: boolean = false,
    ongoingOnly: boolean = true,
  ) {
    const orderBy: any = byStartDate ? { date: 'desc' } : { createdAt: 'desc' }

    const fromDate = isNaN(Date.parse(from)) ? undefined : new Date(from)
    const toDate = isNaN(Date.parse(to)) ? undefined : new Date(to)

    const events = await this.eventRepository.findMany({
      where: {
        name: { search },
        description: { search },
        location: { search: location !== '' ? location : search },
        categories:
          categories && categories[0] !== ''
            ? { hasSome: categories }
            : undefined,
        date: { gte: fromDate, lte: toDate },
        OR:
          endedOnly || ongoingOnly
            ? [
                {
                  endDate: endedOnly
                    ? { lte: new Date().toISOString() }
                    : ongoingOnly
                      ? { gt: new Date().toISOString() }
                      : undefined,
                },
                { endDate: ongoingOnly ? null : undefined },
              ]
            : undefined,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: { images: true, user: true },
      orderBy: search
        ? {
            _relevance: {
              fields: ['name', 'description', 'location'],
              search,
              sort: 'asc',
            },
          }
        : orderBy,
      skip: isNaN(page) ? 0 : page * this.perPage,
      take: this.perPage,
    })

    const eventWithAvailableTicket = await this.eventRepository.findMany({
      where: {
        id: { in: [...events.map((e) => e.id)] },
        tickets: { some: { currentStock: { gt: 0 } } },
      },
      select: { id: true },
    })

    return events.map((event) => ({
      ...event,
      ticketAvailable: eventWithAvailableTicket.some((t) => t.id === event.id),
    }))
  }

  /**
   * @param distance in kilometers
   */
  async findNearestPublishedEvents(
    user: UserEntity,
    count: number = 5,
    distance: number = 5,
  ) {
    const events = await this.eventRepository.findNearbyByUserLocation(
      user.id,
      {
        distance,
        count,
        status: 'PUBLISHED',
      },
    )

    const eventImages = await this.eventRepository.findEventImages({
      where: {
        eventId: {
          in: [...events.map((e) => e.id)],
        },
      },
    })

    const eventWithAvailableTicket = await this.eventRepository.findMany({
      where: {
        id: { in: [...events.map((e) => e.id)] },
        tickets: { some: { currentStock: { gt: 0 } } },
      },
      select: { id: true },
    })

    return events.map((event) => ({
      ...event,
      images: eventImages.filter((image) => image.eventId === event.id),
      ticketAvailable: eventWithAvailableTicket.some((t) => t.id === event.id),
    }))
  }

  async findOne(
    id: string,
    user?: UserEntity,
    checkStatus = true,
    status: 'PUBLISHED' | 'DRAFT' | 'CANCELLED' = 'PUBLISHED',
  ) {
    const event = await this.eventRepository.findOne({
      where: {
        id,
        status: checkStatus ? status : undefined,
        deletedAt: null,
        userId: user ? user.id : undefined,
      },
      include: {
        images: true,
        tickets: {
          include: {
            _count: {
              select: { purchases: { where: { status: 'COMPLETED' } } },
            },
          },
        },
        user: true,
      },
    })

    if (!event) throw new NotFoundException()

    return event
  }

  async myEvents(
    user: UserEntity,
    status: 'PUBLISHED' | 'DRAFT' | 'CANCELLED' = 'PUBLISHED',
    page: number = 0,
    byStartDate: boolean = false,
    from?: string,
    to?: string,
    search?: string,
    location?: string,
    categories?: string[],
    endedOnly: boolean = false,
    ongoingOnly: boolean = true,
  ) {
    const orderBy: any = byStartDate ? { date: 'desc' } : { createdAt: 'desc' }

    const fromDate = isNaN(Date.parse(from)) ? undefined : new Date(from)
    const toDate = isNaN(Date.parse(to)) ? undefined : new Date(to)

    const events = await this.eventRepository.findMany({
      where: {
        userId: user.id,
        name: { search },
        description: { search },
        location: { search: location !== '' ? location : search },
        categories:
          categories && categories[0] !== ''
            ? { hasSome: categories }
            : undefined,
        date: { gte: fromDate, lte: toDate },
        endDate: endedOnly
          ? { lte: new Date().toISOString() }
          : ongoingOnly
            ? { gt: new Date().toISOString() }
            : undefined,
        status,
        deletedAt: null,
      },
      include: { images: true },
      orderBy: search
        ? {
            _relevance: {
              fields: ['name', 'description', 'location'],
              search,
              sort: 'asc',
            },
          }
        : orderBy,
      skip: isNaN(page) ? 0 : page * this.perPage,
      take: this.perPage,
    })

    const eventWithAvailableTicket = await this.eventRepository.findMany({
      where: {
        id: { in: [...events.map((e) => e.id)] },
        tickets: { some: { currentStock: { gt: 0 } } },
      },
      select: { id: true },
    })

    return events.map((event) => ({
      ...event,
      ticketAvailable: eventWithAvailableTicket.some((t) => t.id === event.id),
    }))
  }

  async update(
    user: UserEntity,
    id: string,
    updateEventDto: UpdateEventDto,
    newEventImages?: Express.Multer.File[],
  ) {
    await this.verifyEventOwner(user, id)

    const images: {
      id: number
      description: string
      image: string
      delete: boolean
    }[] = []

    const newEventImagesCopy = newEventImages.slice()

    for (let index = 0; index < updateEventDto.images.length; index++) {
      let filename: string = undefined

      if (updateEventDto.images[index].withImage) {
        filename = await this.storageService.generateRandomFilename(
          newEventImagesCopy.shift().originalname,
        )
      }

      const desc = updateEventDto.images[index].description

      images.push({
        id: updateEventDto.images[index].id,
        description: desc ? undefined : desc,
        image: filename,
        delete: updateEventDto.images[index].delete,
      })
    }
    // get old images
    const oldAndDeletedEventImages = await this.eventRepository.findEventImages(
      {
        where: {
          eventId: id,
          id: {
            in: [
              ...updateEventDto.images
                .filter((e) => (e.id && e.withImage) || (e.id && e.delete))
                .map((e) => e.id),
            ],
          },
        },
      },
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images: _, ...event } = updateEventDto

    // update event & event images
    try {
      const updatedEvent = await this.eventRepository.update({
        where: { id, deletedAt: null },
        data: event,
        updatedImages: images
          .filter((e) => !(e.delete ?? false))
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .map(({ delete: _, ...e }) => e),
        deletedImages: images.filter((e) => e.delete),
        include: { images: true, tickets: false },
      })
      // save new images
      for (const image of images) {
        if (image.image && !image.delete) {
          const imageFile = newEventImages.shift()
          await this.storageService.createFile(
            config.storage.eventImagePath,
            image.image,
            imageFile.buffer,
          )
        }
      }
      // delete old & deleted image files
      for (const image of oldAndDeletedEventImages) {
        if (image) {
          this.storageService.deleteFile(
            config.storage.eventImagePath,
            image.image,
          )
        }
      }

      return updatedEvent
    } catch (e) {
      console.error(e)

      // delete new image files if error
      for (const image of images) {
        if (image.image && !image.delete) {
          this.storageService.deleteFile(
            config.storage.eventImagePath,
            image.image,
          )
        }
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

  public async verifyEventOwner(
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
