import { Injectable } from '@nestjs/common'
import { $Enums, Prisma, PrismaClient } from '@prisma/client'
import { Sql, raw } from '@prisma/client/runtime/library'
import { PrismaService } from '../prisma/prisma.service'
import { EventEntity } from './entities/event.entity'

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
    select?: Prisma.EventSelect
    orderBy?: Prisma.EventOrderByWithRelationInput
    skip?: number
    take?: number
  }) {
    const { where, include, orderBy, skip, take, select } = params

    const selectOrInclude: any = include
      ? {
          include: include ?? {
            tickets: true,
            images: true,
          },
        }
      : { select }

    return await this.prismaService.event.findMany({
      ...selectOrInclude,
      where: where ?? { status: $Enums.EventStatus.PUBLISHED, deletedAt: null },
      orderBy: orderBy ? [orderBy] : undefined,
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
    updatedImages?:
      | Prisma.EventImageUncheckedUpdateWithoutEventInput[]
      | Prisma.EventImageCreateInput[]
    deletedImages?: { id: number }[]
  }) {
    const { where, data, include, updatedImages, deletedImages } = params

    return await this.prismaService.$transaction(async (tx) => {
      // Create or update event images
      if (updatedImages) {
        await Promise.all(
          updatedImages
            .filter((e: any) => e.id !== undefined || e.image !== undefined)
            .map((e: any) =>
              tx.eventImage.upsert({
                create: {
                  ...e,
                  eventId: where.id,
                  id: undefined,
                  image: e.image ?? '',
                },
                update: { ...e, id: undefined },
                where: { id: e.id ?? -1 },
              }),
            ),
        )
      }
      // Delete event images
      if (deletedImages) {
        await Promise.all(
          deletedImages.map((e: { id: number }) =>
            tx.eventImage.delete({ where: { id: e.id } }),
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
  ): Promise<EventEntity[]> {
    const { distance, count, status } = params

    return await this.prismaService.$queryRaw`SELECT ${this.columnStrings}
     FROM "Event" e WHERE "public"."st_distance"(
            e."locationGeography",
            (SELECT "locationGeography" FROM "User" u WHERE u.id = ${userId})
        ) / 1000 <= ${distance} AND e."status" = ${status}::"EventStatus" LIMIT ${count}`
  }
}
