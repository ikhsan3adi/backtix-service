import { ConflictException, Injectable } from '@nestjs/common'
import { User, Prisma } from '@prisma/client'
import { UserRepository } from './user.repository'
import { CreateUserDto } from './dto/create-user.dto'
import { UserEntity } from './entities/user.entity'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userRepository.create(createUserDto)
  }

  async getUserDetails(id: string) {
    return await this.userRepository.findUnique({
      where: { id },
      include: { balance: true },
    })
  }

  async findUniqueBy(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return await this.userRepository.findUnique({ where })
  }

  async checkEmailUsername(params: { username: string; email: string }) {
    const { username, email } = params
    const userAvailable = await this.userRepository.find({
      where: {
        OR: [{ email: email }, { username: username }],
      },
      select: { email: true, username: true },
    })

    if (userAvailable?.email === email) {
      throw new ConflictException(`Email ${email} already registered`)
    } else if (username && userAvailable?.username === username) {
      throw new ConflictException(`Username ${username} already registered`)
    }
  }

  async activate(id: string) {
    return await this.userRepository.update({
      where: { id },
      data: { activated: true },
    })
  }

  async editUser(admin: UserEntity, id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update({
      where: { id },
      data: {
        ...updateUserDto,
        balance: {
          update: {
            where: { userId: id },
            data: { balance: updateUserDto.balance },
          },
        },
      },
      include: { balance: true },
    })
  }
}
