import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign Up' })
  @Public()
  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.authService.registerUser(createUserDto))
  }

  @ApiOperation({ summary: 'Sign In' })
  @ApiBody({
    schema: { example: { username: 'user123', password: 'Secret123#' } },
  })
  @ApiResponse({
    status: '2XX',
    schema: {
      example: {
        accessToken: 'exampleJwtAccessToken',
        refreshToken: 'exampleJwtRefreshToken',
      },
    },
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post()
  async signIn(@User() user: UserEntity) {
    return await this.authService.login(user)
  }

  @ApiOperation({ summary: 'Refresh Authentication' })
  @ApiBody({ schema: { example: { refreshToken: 'exampleJwtRefreshToken' } } })
  @ApiResponse({
    status: '2XX',
    schema: { example: { accessToken: 'exampleJwtAccessToken' } },
  })
  @Public()
  @UseGuards(RefreshAuthGuard)
  @Put()
  async refreshAuth(@User() user: UserEntity) {
    return await this.authService.refreshAuth(user)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign Out' })
  @ApiBody({ schema: { example: { refreshToken: 'exampleJwtRefreshToken' } } })
  @AllowUnactivated()
  @Delete()
  @HttpCode(200)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request Activation OTP via email' })
  @AllowUnactivated()
  @Post('activate')
  async requestActivation(@User() user: UserEntity) {
    return await this.authService.requestActivation(user)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate User using OTP' })
  @ApiBody({ schema: { example: { otp: 123456 } } })
  @AllowUnactivated()
  @Patch('activate')
  async activateUser(@User() user: UserEntity, @Body('otp') otp: string) {
    return new UserEntity(await this.authService.activateUser(user, otp))
  }
}
