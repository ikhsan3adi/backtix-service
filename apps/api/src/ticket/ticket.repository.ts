import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TicketRepository {
  constructor(private prismaService: PrismaService) {}

  async create(params: {
    data: Prisma.TicketCreateInput
    include?: Prisma.TicketInclude
  }) {
    const { data, include } = params
    return await this.prismaService.ticket.create({ data, include })
  }

  async findOne(params: {
    where: Prisma.TicketWhereUniqueInput
    include?: Prisma.TicketInclude
  }) {
    const { where, include } = params
    return await this.prismaService.ticket.findUnique({
      where,
      include: include ?? {
        event: true,
        purchases: true,
      },
    })
  }

  async update(params: {
    where: Prisma.TicketWhereUniqueInput
    data?: Prisma.TicketUpdateInput
    include?: Prisma.TicketInclude
  }) {
    const { where, data, include } = params

    return await this.prismaService.ticket.update({
      where,
      data,
      include,
    })
  }

  async remove(params: {
    where: Prisma.TicketWhereUniqueInput
    include?: Prisma.TicketInclude
  }) {
    const { where, include } = params
    return await this.prismaService.ticket.delete({
      where,
      include,
    })
  }
}
