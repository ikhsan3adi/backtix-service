import { Injectable } from '@nestjs/common'
import { $Enums, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class EventRepository {
  constructor(private prismaService: PrismaService) {}

  async create(params: {
    data: Prisma.EventCreateInput
    include?: Prisma.EventInclude
  }) {
    const { data, include } = params
    return await this.prismaService.event.create({ data, include })
  }

  async findMany(params: {
    where?: Prisma.EventWhereInput
    include?: Prisma.EventInclude
    orderBy?: Prisma.EventOrderByWithRelationInput
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
      orderBy,
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
}
