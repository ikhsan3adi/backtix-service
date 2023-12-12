import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { Public } from './decorators/public.decorator'
import { RefreshAuthGuard } from './guards/refresh-auth.guard'
import { User } from '../user/decorators/user.decorator'
import { UserEntity } from '../user/entities/user.entity'
import { AllowUnactivated } from './decorators/allow-unactivated.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto)
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post()
  async signIn(@User() user: UserEntity) {
    return await this.authService.login(user)
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Put()
  async refreshAuth(@User() user: UserEntity) {
    return await this.authService.refreshAuth(user)
  }

  @AllowUnactivated()
  @Delete()
  @HttpCode(200)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken)
  }
}
