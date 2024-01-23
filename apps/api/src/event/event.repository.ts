import { Injectable } from '@nestjs/common'
import { $Enums, Prisma, PrismaClient } from '@prisma/client'
import { Sql, raw } from '@prisma/client/runtime/library'
import { PrismaService } from '../prisma/prisma.service'
import { Event } from './entities/event.entity'

@Injectable()
export class EventRepository {
  constructor(private prismaService: PrismaService) {
    const fields = this.prismaService.event.fields
    const columns = []
    for (const prop in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, prop)) {
        columns.push(`e."${prop}"`)
      }
    }
    this.columnStrings = raw(columns.join(', '))
  }

  private columnStrings: Sql

  async create(params: {
    data: Prisma.EventCreateInput
    include?: Prisma.EventInclude
  }) {
    const { data, include } = params

    return await this.prismaService.$transaction(async (tx) => {
      const event = await tx.event.create({ data, include })

      // Update postgis geography
      if (data.latitude && data.longitude) {
        await this.updateLocationGeography(
          event.id,
          {
            lat: data.latitude,
            long: data.longitude,
          },
          tx as PrismaClient,
        )
      }

      return event
    })
  }

  async findMany(params: {
    where?: Prisma.EventWhereInput
    include?: Prisma.EventInclude
    orderBy?: Prisma.EventOrderByWithRelationAndSearchRelevanceInput
    skip?: number
    take?: number
  }) {
    const { where, include, orderBy, skip, take } = params
    return await this.prismaService.event.findMany({
      where: where ?? { status: $Enums.EventStatus.PUBLISHED, deletedAt: null },
      include: include ?? {
        tickets: true,
        images: true,
      },
      orderBy: [orderBy],
      skip,
      take,
    })
  }

  async findOne(params: {
    where: Prisma.EventWhereUniqueInput
    include?: Prisma.EventInclude
  }) {
    const { where, include } = params
    return await this.prismaService.event.findUnique({
      where,
      include: include ?? {
        tickets: true,
        images: true,
      },
    })
  }

  async findEventImages(params: {
    where: Prisma.EventImageWhereInput
    include?: Prisma.EventImageInclude
  }) {
    const { where, include } = params
    return await this.prismaService.eventImage.findMany({ where, include })
  }

  async update(params: {
    where: Prisma.EventWhereUniqueInput
    data?: Prisma.EventUpdateInput
    include?: Prisma.EventInclude
    updatedImages?: Prisma.EventImageUncheckedUpdateWithoutEventInput[]
  }) {
    const { where, data, include, updatedImages } = params

    return await this.prismaService.$transaction(async (tx) => {
      if (updatedImages) {
        await Promise.all(
          updatedImages.map((e) =>
            tx.eventImage.update({
              data: { ...e, id: undefined },
              where: { id: e.id as number },
            }),
          ),
        )
      }

      // Update postgis geography
      if (where.id && data.latitude && data.longitude) {
        await this.updateLocationGeography(
          where.id,
          {
            lat: Number(data.latitude),
            long: Number(data.longitude),
          },
          tx as PrismaClient,
        )
      }

      return await tx.event.update({
        where,
        data,
        include,
      })
    })
  }

  async remove(params: {
    where: Prisma.EventWhereUniqueInput
    include?: Prisma.EventInclude
  }) {
    const { where, include } = params
    return await this.prismaService.event.delete({
      where,
      include: include ?? {
        tickets: true,
        images: true,
      },
    })
  }

  async updateLocationGeography(
    id: string,
    params: { lat: number; long: number },
    tx?: PrismaClient,
  ) {
    const { long, lat } = params
    const client = tx ?? this.prismaService

    return await client.$queryRaw`UPDATE "Event" SET "locationGeography" = "public"."st_point"(${long}, ${lat}) WHERE id = ${id}`
  }

  async findNearbyByUserLocation(
    userId: string,
    params: { distance: number; count: number; status: $Enums.EventStatus },
  ) {
    const { distance, count, status } = params

    const events: Event[] = await this.prismaService
      .$queryRaw`SELECT ${this.columnStrings}
     FROM "Event" e WHERE "public"."st_distance"(
            e."locationGeography",
            (SELECT "locationGeography" FROM "User" u WHERE u.id = ${userId})
        ) / 1000 <= ${distance} AND e."status" = ${status}::"EventStatus" LIMIT ${count}`

    const eventImages = await this.prismaService.eventImage.findMany({
      where: {
        eventId: {
          in: [...events.map((e) => e.id)],
        },
      },
    })

    return events.map((event) => ({
      ...event,
      images: eventImages.filter((image) => image.eventId === event.id),
    }))
  }
}
