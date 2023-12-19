import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
  ParseFilePipe,
  UploadedFile,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { UserEntity } from './entities/user.entity'
import { User } from './decorators/user.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { imageValidators } from '../common/files/file-validators'
import { Groups } from '../auth/decorators/groups.decorator'
import { Group } from './enums/group.enum'
import { AdminUpdateUserDto } from './dto/admin-update-user.dto'

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my')
  async myDetails(@User() user: UserEntity) {
    return new UserEntity(await this.userService.getUserDetails(user.id))
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Patch('my')
  async editMyUser(
    @User() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({ validators: imageValidators, fileIsRequired: false }),
    )
    image: Express.Multer.File,
  ) {
    return new UserEntity(
      await this.userService.editUser(user.id, updateUserDto, image),
    )
  }

  @ApiConsumes('multipart/form-data')
  @Groups(Group.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @Patch('/:id')
  async editUserByAdmin(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({ validators: imageValidators, fileIsRequired: false }),
    )
    image: Express.Multer.File,
  ) {
    return new UserEntity(
      await this.userService.editUser(id, updateUserDto, image),
    )
  }
}
