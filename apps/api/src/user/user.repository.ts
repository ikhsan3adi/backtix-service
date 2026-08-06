import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient, User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    return await this.prismaService.$transaction(async (tx) => {
      const createdUser = await this.prismaService.user.create({
        data: { ...user, balance: { create: { balance: 0 } } },
      })

      if (user.latitude && user.longitude) {
        await this.updateLocationGeography(
          createdUser.id,
          {
            lat: Number(user.latitude),
            long: Number(user.longitude),
          },
          tx as PrismaClient,
        )
      }

      return createdUser
    })
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
    select?: Prisma.UserSelect
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy, select } = params
    return this.prismaService.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select,
    })
  }

  async findUnique(params: {
    where: Prisma.UserWhereUniqueInput
    include?: Prisma.UserInclude
  }): Promise<User> {
    const { where, include } = params
    return await this.prismaService.user.findUnique({
      where,
      include,
    })
  }

  async find(params: {
    where: Prisma.UserWhereInput
    select?: Prisma.UserSelect
  }): Promise<User> {
    const { where, select } = params
    return await this.prismaService.user.findFirst({
      where,
      select,
    })
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput
    data?: Prisma.UserUpdateInput
    include?: Prisma.UserInclude
  }) {
    const { where, data, include } = params

    return await this.prismaService.$transaction(async (tx) => {
      if (where.id && data.latitude && data.longitude) {
        const u = await this.updateLocationGeography(
          where.id,
          {
            lat: Number(data.latitude),
            long: Number(data.longitude),
          },
          tx as PrismaClient,
        )

        console.log(u)
      }

      return await tx.user.update({
        where,
        data,
        include,
      })
    })
  }

  async updateLocationGeography(
    id: string,
    params: { lat: number; long: number },
    tx?: PrismaClient,
  ) {
    const { long, lat } = params
    const client = tx ?? this.prismaService

    return await client.$queryRaw`UPDATE "User" SET "locationGeography" = "public"."st_point"(${long}, ${lat}) WHERE id = ${id}`
  }
}
