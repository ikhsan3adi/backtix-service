import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { User, Prisma } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    return await this.prismaService.user.create({ data: user })
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
    select?: Prisma.UserSelect
  }): Promise<User> {
    const { where, select } = params
    return await this.prismaService.user.findUnique({
      where,
      select,
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
}
