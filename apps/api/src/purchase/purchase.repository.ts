import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PurchaseRepository {
  constructor(private prismaService: PrismaService) {}

  async create(params: {
    data: Prisma.PurchaseCreateInput
    include?: Prisma.PurchaseInclude
  }) {
    const { data, include } = params
    return await this.prismaService.purchase.create({ data, include })
  }

  async findMany(params: {
    where?: Prisma.PurchaseWhereInput
    include?: Prisma.PurchaseInclude
    skip?: number
    take?: number
  }) {
    const { where, include, skip, take } = params
    return await this.prismaService.purchase.findMany({
      where: where,
      include: include,
      skip,
      take,
    })
  }

  async findOne(params: {
    where: Prisma.PurchaseWhereUniqueInput
    include?: Prisma.PurchaseInclude
  }) {
    const { where, include } = params
    return await this.prismaService.purchase.findUnique({
      where,
      include: include ?? { ticket: true, user: true },
    })
  }

  async update(params: {
    where: Prisma.PurchaseWhereUniqueInput
    data?: Prisma.PurchaseUpdateInput
    include?: Prisma.PurchaseInclude
  }) {
    const { where, data, include } = params

    return await this.prismaService.purchase.update({
      where,
      data,
      include,
    })
  }

  async remove(params: {
    where: Prisma.PurchaseWhereUniqueInput
    include?: Prisma.PurchaseInclude
  }) {
    const { where, include } = params
    return await this.prismaService.purchase.delete({
      where,
      include,
    })
  }

  async createTransactions<T>(callback: (tx: PrismaClient) => Promise<T>) {
    return await this.prismaService.$transaction<T>(callback)
  }
}
