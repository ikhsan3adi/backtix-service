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

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create() {}

  @Get()
  findAll() {}

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
