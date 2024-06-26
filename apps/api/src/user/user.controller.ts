import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
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
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UpdateUserPasswordDto } from './dto/update-user-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserEntity } from './entities/user.entity'
import { Group } from './enums/group.enum'
import { UserService } from './user.service'

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @AllowUnactivated()
  @Get('my')
  async myDetails(@User() user: UserEntity) {
    return new UserEntity(await this.userService.getUserDetails(user.id))
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Put('my')
  async editMyUser(
    @User() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({ validators: imageValidators, fileIsRequired: false }),
    )
    image: Express.Multer.File,
  ): Promise<{
    user: UserEntity
    newAuth: { accessToken: string; refreshToken: string }
  }> {
    return await this.userService.editUser({
      id: user.id,
      updateUserDto,
      oldUser: user,
      image: image,
    })
  }

  @Post('my/password/reset')
  async requestPasswordReset(@User() user: UserEntity) {
    return await this.userService.requestPasswordReset(user)
  }

  @Patch('my/password/reset')
  async passwordReset(@User() user: UserEntity, @Body() dto: ResetPasswordDto) {
    return new UserEntity(await this.userService.passwordReset(user, dto))
  }

  @Patch('my/password')
  async updateMyPassword(
    @User() user: UserEntity,
    @Body() dto: UpdateUserPasswordDto,
  ) {
    return new UserEntity(await this.userService.updateUserPassword(user, dto))
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
      (await this.userService.editUser({ id, updateUserDto, image })).user,
    )
  }
}
