/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserEntity } from './entities/user.entity'
import { User } from './decorators/user.decorator'

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my')
  async myDetails(@User() user: UserEntity) {
    return new UserEntity(await this.userService.getUserDetails(user.id))
  }

  @Patch('/:id')
  async editUserByAdmin(
    @User() admin: UserEntity,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.editUser(admin, id, updateUserDto)
  }
}
