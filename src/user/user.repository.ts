import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    return await this.prismaService.user.create({
      data: { ...user, balance: { create: { balance: 0 } } },
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

    return await this.prismaService.user.update({
      where,
      data,
      include,
    })
  }
}
