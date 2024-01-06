import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { AllowUnactivated } from '../auth/decorators/allow-unactivated.decorator'
import { Groups } from '../auth/decorators/groups.decorator'
import { imageValidators } from '../common/files/file-validators'
import { User } from './decorators/user.decorator'
import { AdminUpdateUserDto } from './dto/admin-update-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserEntity } from './entities/user.entity'
import { Group } from './enums/group.enum'
import { UserService } from './user.service'

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @AllowUnactivated()
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
